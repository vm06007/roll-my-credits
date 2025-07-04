import torch
import numpy as np
import hashlib

class TextEncoder:
    def __init__(self, embedding_size=768):
        self.embedding_size = embedding_size
        self.vocab_size = 256

    def text_to_embedding(self, text):
        text_bytes = text.encode('utf-8')

        padded_bytes = text_bytes + b'\x00' * (self.embedding_size - len(text_bytes))
        if len(padded_bytes) > self.embedding_size:
            padded_bytes = padded_bytes[:self.embedding_size]

        embedding = np.array([b for b in padded_bytes], dtype=np.float32) / 255.0

        embedding = embedding * 2 - 1

        return torch.tensor(embedding, dtype=torch.float32)

    def embedding_to_text(self, embedding):
        embedding_np = embedding.detach().cpu().numpy()

        embedding_np = (embedding_np + 1) / 2

        bytes_array = (embedding_np * 255).astype(np.uint8)

        text_bytes = bytes(bytes_array)

        text = text_bytes.decode('utf-8', errors='ignore').rstrip('\x00')

        return text

    def seed_phrase_to_embedding(self, seed_phrase):
        words = seed_phrase.strip().split()
        if len(words) > 12:
            words = words[:12]
        elif len(words) < 12:
            words.extend([''] * (12 - len(words)))

        full_text = ' '.join(words)
        return self.text_to_embedding(full_text)

    def embedding_to_seed_phrase(self, embedding):
        text = self.embedding_to_text(embedding)
        words = text.strip().split()
        return ' '.join(words[:12])


class TextAugmentor:
    @staticmethod
    def add_noise(embedding, noise_factor=0.01):
        noise = torch.randn_like(embedding) * noise_factor
        return embedding + noise

    @staticmethod
    def apply_dropout(embedding, dropout_rate=0.1):
        mask = torch.rand_like(embedding) > dropout_rate
        return embedding * mask