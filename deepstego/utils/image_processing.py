import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import io

class ImageProcessor:
    def __init__(self, image_size=256):
        self.image_size = image_size

        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size), interpolation=transforms.InterpolationMode.LANCZOS),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

        self.denormalize = transforms.Compose([
            transforms.Normalize(mean=[-1, -1, -1], std=[2, 2, 2]),
            transforms.Lambda(lambda x: torch.clamp(x, 0, 1))
        ])

    def load_image(self, image_path):
        image = Image.open(image_path).convert('RGB')
        return self.transform(image).unsqueeze(0)

    def load_image_from_bytes(self, image_bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        return self.transform(image).unsqueeze(0)

    def tensor_to_image(self, tensor):
        tensor = tensor.squeeze(0)
        tensor = self.denormalize(tensor)

        tensor = tensor.cpu()

        np_image = tensor.permute(1, 2, 0).numpy()
        np_image = (np_image * 255).astype(np.uint8)

        return Image.fromarray(np_image)

    def save_image(self, tensor, path):
        image = self.tensor_to_image(tensor)
        image.save(path)

    def image_to_bytes(self, tensor):
        image = self.tensor_to_image(tensor)
        byte_arr = io.BytesIO()
        image.save(byte_arr, format='PNG')
        return byte_arr.getvalue()


def calculate_psnr(original, stego):
    mse = torch.mean((original - stego) ** 2)
    if mse == 0:
        return float('inf')
    max_pixel = 1.0
    psnr = 20 * torch.log10(max_pixel / torch.sqrt(mse))
    return psnr.item()


def calculate_ssim(img1, img2):
    C1 = (0.01 * 2) ** 2
    C2 = (0.03 * 2) ** 2

    mu1 = img1.mean(dim=[2, 3], keepdim=True)
    mu2 = img2.mean(dim=[2, 3], keepdim=True)

    sigma1_sq = ((img1 - mu1) ** 2).mean(dim=[2, 3], keepdim=True)
    sigma2_sq = ((img2 - mu2) ** 2).mean(dim=[2, 3], keepdim=True)
    sigma12 = ((img1 - mu1) * (img2 - mu2)).mean(dim=[2, 3], keepdim=True)

    ssim_map = ((2 * mu1 * mu2 + C1) * (2 * sigma12 + C2)) / \
               ((mu1 ** 2 + mu2 ** 2 + C1) * (sigma1_sq + sigma2_sq + C2))

    return ssim_map.mean().item()