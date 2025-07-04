#!/usr/bin/env python3

import torch
import torch.nn as nn
import torch.optim as optim
import os
import random
from tqdm import tqdm

from models.networks import DeepStego
from utils.text_processing import TextEncoder
from utils.image_processing import ImageProcessor

def quick_train():
    print("Quick Training for Demo...")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Initialize
    model = DeepStego().to(device)
    text_encoder = TextEncoder()
    image_processor = ImageProcessor(image_size=256)

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    mse_loss = nn.MSELoss()

    # Simple training data
    phrases = [
        "my secret wallet phrase",
        "bitcoin ethereum crypto safe",
        "blockchain technology secure hidden",
        "steganography neural network deep",
        "artificial intelligence machine learning",
        "password secure authentication token",
        "private key digital signature",
        "encryption decryption security protocol"
    ]

    print("Training for better text recovery...")
    model.train()

    for epoch in range(20):  # Quick training
        total_loss = 0

        for i in range(10):  # 10 batches per epoch
            # Create random image
            cover_image = torch.randn(1, 3, 256, 256).to(device) * 0.5

            # Random phrase
            phrase = random.choice(phrases)
            text_embedding = text_encoder.seed_phrase_to_embedding(phrase).unsqueeze(0).to(device)

            # Forward pass
            stego_image, revealed_text = model(cover_image, text_embedding)

            # Losses
            image_loss = mse_loss(stego_image, cover_image) * 5
            text_loss = mse_loss(revealed_text, text_embedding) * 100

            total_loss_val = image_loss + text_loss

            # Backward pass
            optimizer.zero_grad()
            total_loss_val.backward()
            optimizer.step()

            total_loss += total_loss_val.item()

        avg_loss = total_loss / 10
        if epoch % 5 == 0:
            print(f"Epoch {epoch}: Loss = {avg_loss:.4f}")

    # Save model
    os.makedirs("checkpoints", exist_ok=True)
    torch.save(model.state_dict(), "checkpoints/deepstego_final.pth")
    print("✓ Quick training completed!")

    # Test the model
    print("\nTesting trained model...")
    model.eval()

    test_phrase = "my secret text message"
    cover_image = torch.randn(1, 3, 256, 256).to(device) * 0.3
    text_embedding = text_encoder.seed_phrase_to_embedding(test_phrase).unsqueeze(0).to(device)

    with torch.no_grad():
        stego_image = model.encode(cover_image, text_embedding)
        revealed_embedding = model.decode(stego_image)
        recovered_phrase = text_encoder.embedding_to_seed_phrase(revealed_embedding[0])

    print(f"Original:  '{test_phrase}'")
    print(f"Recovered: '{recovered_phrase}'")

    return True

if __name__ == "__main__":
    quick_train()