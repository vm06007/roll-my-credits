import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        out = F.relu(out)
        return out


class PrepNetwork(nn.Module):
    def __init__(self, input_channels=3, text_embedding_size=768):
        super(PrepNetwork, self).__init__()
        self.conv1 = nn.Conv2d(input_channels, 64, kernel_size=7, stride=2, padding=3)
        self.bn1 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

        self.res_layers = nn.Sequential(
            ResidualBlock(64, 64),
            ResidualBlock(64, 128, stride=2),
            ResidualBlock(128, 256, stride=2),
            ResidualBlock(256, 512, stride=2)
        )

        self.text_fc = nn.Linear(text_embedding_size, 512 * 8 * 8)

    def forward(self, image, text_embedding):
        x = F.relu(self.bn1(self.conv1(image)))
        x = self.pool(x)
        x = self.res_layers(x)

        text_features = self.text_fc(text_embedding)
        text_features = text_features.view(-1, 512, 8, 8)

        combined = x + text_features
        return combined


class HidingNetwork(nn.Module):
    def __init__(self):
        super(HidingNetwork, self).__init__()
        self.deconv_layers = nn.Sequential(
            nn.ConvTranspose2d(512, 256, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1),
            nn.Tanh()
        )

    def forward(self, x):
        return self.deconv_layers(x)


class RevealNetwork(nn.Module):
    def __init__(self, text_embedding_size=768):
        super(RevealNetwork, self).__init__()
        self.conv_layers = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),

            ResidualBlock(64, 128, stride=2),
            ResidualBlock(128, 256, stride=2),
            ResidualBlock(256, 512, stride=2),
            ResidualBlock(512, 1024, stride=2),

            nn.AdaptiveAvgPool2d((1, 1))
        )

        self.fc = nn.Sequential(
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, text_embedding_size)
        )

    def forward(self, x):
        features = self.conv_layers(x)
        features = features.view(features.size(0), -1)
        text_embedding = self.fc(features)
        return text_embedding


class DeepStego(nn.Module):
    def __init__(self, text_embedding_size=768):
        super(DeepStego, self).__init__()
        self.prep_network = PrepNetwork(text_embedding_size=text_embedding_size)
        self.hiding_network = HidingNetwork()
        self.reveal_network = RevealNetwork(text_embedding_size=text_embedding_size)

    def forward(self, cover_image, text_embedding):
        prepped = self.prep_network(cover_image, text_embedding)

        residual = self.hiding_network(prepped)
        stego_image = cover_image + 0.05 * residual
        stego_image = torch.clamp(stego_image, -1, 1)

        revealed_text = self.reveal_network(stego_image)

        return stego_image, revealed_text

    def encode(self, cover_image, text_embedding):
        prepped = self.prep_network(cover_image, text_embedding)
        residual = self.hiding_network(prepped)
        stego_image = cover_image + 0.05 * residual
        stego_image = torch.clamp(stego_image, -1, 1)
        return stego_image

    def decode(self, stego_image):
        return self.reveal_network(stego_image)