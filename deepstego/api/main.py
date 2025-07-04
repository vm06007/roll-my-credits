from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import torch
import os
import io
from typing import Optional
import base64

from models.networks import DeepStego
from utils.text_processing import TextEncoder
from utils.image_processing import ImageProcessor
from utils.simple_stego import HybridStego

app = FastAPI(title="DeepStego API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DeepStego().to(device)
text_encoder = TextEncoder()
image_processor = ImageProcessor()

model_path = "checkpoints/deepstego_final.pth"
neural_model = None
if os.path.exists(model_path):
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        neural_model = model
        print(f"Neural model loaded from {model_path}")
    except Exception as e:
        print(f"Failed to load neural model: {e}")
else:
    print("No pre-trained model found. Using LSB fallback.")

# Initialize hybrid steganography system
stego_system = HybridStego(neural_model)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("templates/index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.get("/api")
async def api_root():
    return {"message": "DeepStego API - Deep Learning Based Steganography"}


@app.post("/encode")
async def encode_message(
    image: UploadFile = File(...),
    seed_phrase: str = Form("my secret text")
):
    try:
        print(f"Received seed phrase: '{seed_phrase}'")  # Debug log
        image_bytes = await image.read()

        # Load image as PIL
        from PIL import Image as PILImage
        cover_image = PILImage.open(io.BytesIO(image_bytes)).convert('RGB')

        # Encode using hybrid system
        stego_image = stego_system.encode(cover_image, seed_phrase)

        # Convert to bytes
        byte_arr = io.BytesIO()
        stego_image.save(byte_arr, format='PNG')
        stego_bytes = byte_arr.getvalue()

        encoded_image = base64.b64encode(stego_bytes).decode('utf-8')

        return JSONResponse({
            "success": True,
            "message": "Message encoded successfully",
            "encoded_image": encoded_image,
            "seed_phrase": seed_phrase
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/decode")
async def decode_message(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()

        # Load image as PIL
        from PIL import Image as PILImage
        stego_image = PILImage.open(io.BytesIO(image_bytes)).convert('RGB')

        # Decode using hybrid system
        recovered_phrase = stego_system.decode(stego_image)
        print(f"Decoded phrase: '{recovered_phrase}'")  # Debug log

        return JSONResponse({
            "success": True,
            "recovered_phrase": recovered_phrase
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/encode_file")
async def encode_to_file(
    image: UploadFile = File(...),
    seed_phrase: str = "my secret text"
):
    try:
        image_bytes = await image.read()

        cover_tensor = image_processor.load_image_from_bytes(image_bytes).to(device)

        text_embedding = text_encoder.seed_phrase_to_embedding(seed_phrase).to(device)

        with torch.no_grad():
            stego_tensor = model.encode(cover_tensor, text_embedding)

        output_path = f"static/stego_{image.filename}"
        os.makedirs("static", exist_ok=True)
        image_processor.save_image(stego_tensor, output_path)

        return JSONResponse({
            "success": True,
            "message": "Message encoded successfully",
            "output_file": output_path,
            "seed_phrase": seed_phrase
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": str(device),
        "model_loaded": os.path.exists(model_path)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)