import numpy as np
from PIL import Image

class SimpleStego:
    """Simple but effective steganography for immediate demo"""

    def __init__(self):
        self.channels = 3
        self.bits_per_channel = 2  # Use 2 LSBs for better capacity

    def text_to_binary(self, text):
        """Convert text to binary string"""
        binary = ''.join(format(ord(char), '08b') for char in text)
        # Add delimiter
        binary += '1111111111111110'  # End marker
        return binary

    def binary_to_text(self, binary):
        """Convert binary string back to text"""
        # Find end marker
        end_marker = '1111111111111110'
        end_pos = binary.find(end_marker)
        if end_pos != -1:
            binary = binary[:end_pos]

        # Convert to text
        text = ''
        for i in range(0, len(binary), 8):
            if i + 8 <= len(binary):
                byte = binary[i:i+8]
                try:
                    char = chr(int(byte, 2))
                    if char.isprintable() and char != '\x00':
                        text += char
                except:
                    continue
        return text.strip()

    def encode_image(self, image_array, text):
        """Encode text into image using LSB"""
        binary_text = self.text_to_binary(text)

        # Calculate capacity (2 bits per pixel)
        capacity = image_array.size * 2
        if len(binary_text) > capacity:
            raise ValueError(f"Text too long for image capacity: {len(binary_text)} bits > {capacity} bits")

        # Flatten image
        flat_image = image_array.flatten().astype(np.int32)

        # Encode binary text (2 bits per pixel)
        bit_pairs = [binary_text[i:i+2] for i in range(0, len(binary_text), 2)]

        for i, bit_pair in enumerate(bit_pairs):
            if i < len(flat_image):
                # Pad if necessary
                if len(bit_pair) == 1:
                    bit_pair += '0'

                # Clear 2 LSBs and set new bits
                flat_image[i] = (flat_image[i] & 0xFC) | int(bit_pair, 2)

        # Reshape back
        return flat_image.reshape(image_array.shape).astype(np.uint8)

    def decode_image(self, image_array):
        """Decode text from image using LSB"""
        flat_image = image_array.flatten()

        # Extract bits (use 2 LSBs for better capacity)
        binary_text = ''
        for pixel in flat_image:
            # Extract 2 least significant bits
            binary_text += format(pixel & 3, '02b')

            # Check for end marker every 8 bits
            if len(binary_text) >= 16 and binary_text.endswith('1111111111111110'):
                break

        return self.binary_to_text(binary_text)

    def encode_pil_image(self, pil_image, text):
        """Encode text into PIL image"""
        image_array = np.array(pil_image)
        encoded_array = self.encode_image(image_array, text)
        return Image.fromarray(encoded_array.astype(np.uint8))

    def decode_pil_image(self, pil_image):
        """Decode text from PIL image"""
        image_array = np.array(pil_image)
        return self.decode_image(image_array)


class HybridStego:
    """Combines neural network with simple LSB for reliability"""

    def __init__(self, neural_model=None):
        self.neural_model = neural_model
        self.simple_stego = SimpleStego()

    def encode(self, image, text):
        """Try neural encoding first, fallback to LSB"""
        try:
            if self.neural_model is not None:
                # Neural encoding (for visual quality)
                return self._neural_encode(image, text)
            else:
                # Simple LSB encoding
                return self.simple_stego.encode_pil_image(image, text)
        except Exception as e:
            print(f"Neural encoding failed: {e}, using LSB")
            return self.simple_stego.encode_pil_image(image, text)

    def decode(self, image):
        """Try neural decoding first, fallback to LSB"""
        try:
            if self.neural_model is not None:
                result = self._neural_decode(image)
                if result and len(result.strip()) > 0:
                    return result
        except Exception as e:
            print(f"Neural decoding failed: {e}, using LSB")

        # Fallback to LSB
        return self.simple_stego.decode_pil_image(image)