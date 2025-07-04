#!/usr/bin/env python3

import os
import sys
import subprocess
import torch

def check_dependencies():
    try:
        import fastapi
        import uvicorn
        import torchvision
        print("✓ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def create_demo_model():
    """Create a simple demo model if no trained model exists"""
    from models.networks import DeepStego

    os.makedirs("checkpoints", exist_ok=True)
    model_path = "checkpoints/deepstego_final.pth"

    if not os.path.exists(model_path):
        print("Creating demo model (untrained)...")
        model = DeepStego()
        torch.save(model.state_dict(), model_path)
        print(f"✓ Demo model saved to {model_path}")
        print("Note: This is an untrained model for demo purposes.")
        print("For production use, train the model using: python train.py")
    else:
        print(f"✓ Model found at {model_path}")

def main():
    print("Starting DeepStego Server...")
    print("=" * 50)

    if not check_dependencies():
        sys.exit(1)

    create_demo_model()

    print("\nStarting server on http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "api.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    main()