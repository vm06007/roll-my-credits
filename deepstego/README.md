# DeepStego - Neural Network Steganography

A cutting-edge steganography system using deep learning to hide text messages (like seed phrases) inside images with high invisibility and robustness.

## Features

- **Neural Network Architecture**: Custom autoencoder-style network for hiding and revealing text
- **Advanced Text Encoding**: Supports seed phrases and arbitrary text messages
- **High Quality**: Minimal visual distortion while maintaining message integrity
- **REST API**: Easy-to-use FastAPI backend with encode/decode endpoints
- **Web Interface**: Modern React-like UI for testing and demonstration
- **Production Ready**: Includes training scripts and model checkpoints

## Architecture

### Neural Networks
- **PrepNetwork**: Combines cover image with text embedding
- **HidingNetwork**: Generates residual to hide message in image
- **RevealNetwork**: Extracts hidden message from stego image
- **ResidualBlock**: Building blocks for robust feature extraction

### Text Processing
- **TextEncoder**: Converts text to neural embeddings and back
- **Support for 12-word seed phrases**: Ideal for crypto wallets
- **Robust encoding**: Handles various text formats

### Image Processing
- **High-quality image handling**: Maintains visual fidelity
- **PSNR/SSIM metrics**: Quality assessment tools
- **Flexible input sizes**: Adapts to different image dimensions

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Test the System
```bash
python test_system.py
```

### 3. Start the API Server
```bash
python run_server.py
```

### 4. Access the Web Interface
Open http://localhost:8000 in your browser

## API Endpoints

### Encode Message
```bash
POST /encode
- image: Image file (multipart/form-data)
- seed_phrase: Text message to hide (default: "my secret text")
```

### Decode Message
```bash
POST /decode
- image: Encoded image file (multipart/form-data)
```

### Example Usage
```python
import requests

# Encode
with open('cover_image.jpg', 'rb') as f:
    response = requests.post('http://localhost:8000/encode',
                           files={'image': f},
                           data={'seed_phrase': 'my secret wallet words'})

# Decode
with open('stego_image.png', 'rb') as f:
    response = requests.post('http://localhost:8000/decode',
                           files={'image': f})
    result = response.json()
    print(result['recovered_phrase'])
```

## Training

To train your own model:

```bash
python train.py --epochs 100 --batch_size 16 --num_samples 50000
```

### Training Parameters
- `--epochs`: Number of training epochs (default: 50)
- `--batch_size`: Training batch size (default: 16)
- `--num_samples`: Number of training samples (default: 10000)
- `--device`: Device to use (cuda/cpu, auto-detected)

## Model Architecture Details

### Network Components
1. **Preparation Network**: Combines cover image and text embedding
2. **Hiding Network**: Generates minimal residual modifications
3. **Reveal Network**: Extracts hidden information

### Loss Functions
- **Image Fidelity Loss**: MSE between cover and stego images
- **Text Recovery Loss**: MSE between original and recovered embeddings
- **Perceptual Loss**: L1 loss for visual quality

### Security Features
- **Robust to compression**: Network trained to handle JPEG artifacts
- **Noise resilience**: Augmentation techniques improve robustness
- **High capacity**: Can hide substantial text in standard images

## Production Deployment

### Docker Support
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "run_server.py"]
```

### Security Considerations
- Use HTTPS in production
- Implement rate limiting
- Add authentication for sensitive use cases
- Monitor for abuse

## Use Cases

### Legitimate Applications
- **Crypto Wallet Backup**: Hide seed phrases in personal images
- **Secure Communication**: Covert messaging in images
- **Digital Watermarking**: Invisible copyright protection
- **Data Backup**: Redundant storage of critical information

### Research Applications
- **Steganography Research**: Advanced hiding techniques
- **Neural Network Security**: Adversarial robustness studies
- **Information Theory**: Capacity and detectability analysis

## Technical Specifications

- **Framework**: PyTorch 2.0+
- **API**: FastAPI with async support
- **Frontend**: Modern HTML5/CSS3/JavaScript
- **Image Formats**: PNG, JPEG, WebP support
- **Text Capacity**: Up to 768 characters (expandable)
- **Performance**: Real-time encoding/decoding on modern hardware

## Contributing

This is a research/educational project demonstrating advanced steganography techniques. Contributions welcome for:

- Model architecture improvements
- Training optimization
- Frontend enhancements
- Documentation updates

## License

Educational/Research use only. See LICENSE file for details.

## Citation

If you use this work in research, please cite:
```
DeepStego: Neural Network-Based Steganography
Advanced Steganographic Techniques for Secure Communication
```