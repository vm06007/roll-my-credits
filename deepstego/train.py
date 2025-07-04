import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import os
import argparse
from tqdm import tqdm
import random

from models.networks import DeepStego
from utils.text_processing import TextEncoder, TextAugmentor
from utils.image_processing import calculate_psnr, calculate_ssim


class StegoDataset(Dataset):
    def __init__(self, image_dir, text_encoder, num_samples=10000):
        self.image_dir = image_dir
        self.text_encoder = text_encoder
        self.num_samples = num_samples

        self.transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

        self.seed_phrases = self._generate_seed_phrases(num_samples)

    def _generate_seed_phrases(self, count):
        phrases = []
        words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest',
            'galaxy', 'hammer', 'island', 'jungle', 'kingdom', 'laptop',
            'mountain', 'network', 'ocean', 'planet', 'quantum', 'rocket',
            'shadow', 'thunder', 'universe', 'volcano', 'warrior', 'zebra'
        ]

        for _ in range(count):
            phrase = ' '.join(random.choices(words, k=12))
            phrases.append(phrase)

        return phrases

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        seed_phrase = self.seed_phrases[idx]
        text_embedding = self.text_encoder.seed_phrase_to_embedding(seed_phrase)

        dummy_image = torch.randn(3, 128, 128) * 0.5 + 0.5

        return dummy_image, text_embedding, seed_phrase


def train_model(model, train_loader, num_epochs, device, save_dir='checkpoints'):
    os.makedirs(save_dir, exist_ok=True)

    optimizer = optim.Adam(model.parameters(), lr=0.0001, betas=(0.5, 0.999))

    mse_loss = nn.MSELoss()
    l1_loss = nn.L1Loss()

    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        total_image_loss = 0
        total_text_loss = 0

        progress_bar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs}')

        for batch_idx, (cover_images, text_embeddings, _) in enumerate(progress_bar):
            cover_images = cover_images.to(device)
            text_embeddings = text_embeddings.to(device)

            text_embeddings = TextAugmentor.add_noise(text_embeddings, noise_factor=0.01)

            stego_images, revealed_texts = model(cover_images, text_embeddings)

            image_loss = mse_loss(stego_images, cover_images) * 10
            text_loss = mse_loss(revealed_texts, text_embeddings) * 50

            perceptual_loss = l1_loss(stego_images, cover_images) * 5

            total_loss_value = image_loss + text_loss + perceptual_loss

            optimizer.zero_grad()
            total_loss_value.backward()
            optimizer.step()

            total_loss += total_loss_value.item()
            total_image_loss += image_loss.item()
            total_text_loss += text_loss.item()

            progress_bar.set_postfix({
                'loss': f'{total_loss_value.item():.4f}',
                'img_loss': f'{image_loss.item():.4f}',
                'txt_loss': f'{text_loss.item():.4f}'
            })

        avg_loss = total_loss / len(train_loader)
        avg_image_loss = total_image_loss / len(train_loader)
        avg_text_loss = total_text_loss / len(train_loader)

        print(f'Epoch {epoch+1} - Avg Loss: {avg_loss:.4f}, '
              f'Image Loss: {avg_image_loss:.4f}, Text Loss: {avg_text_loss:.4f}')

        if (epoch + 1) % 10 == 0:
            checkpoint_path = os.path.join(save_dir, f'deepstego_epoch_{epoch+1}.pth')
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'loss': avg_loss,
            }, checkpoint_path)
            print(f'Checkpoint saved: {checkpoint_path}')


def main():
    parser = argparse.ArgumentParser(description='Train DeepStego Model')
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=16, help='Batch size')
    parser.add_argument('--num_samples', type=int, default=10000, help='Number of training samples')
    parser.add_argument('--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu')

    args = parser.parse_args()

    device = torch.device(args.device)
    print(f'Using device: {device}')

    text_encoder = TextEncoder()
    model = DeepStego().to(device)

    dataset = StegoDataset('.', text_encoder, num_samples=args.num_samples)
    train_loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)

    train_model(model, train_loader, args.epochs, device)

    final_path = 'checkpoints/deepstego_final.pth'
    torch.save(model.state_dict(), final_path)
    print(f'Final model saved: {final_path}')


if __name__ == '__main__':
    main()