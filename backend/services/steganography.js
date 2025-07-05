import Jimp from 'jimp';

class SteganographyService {
    constructor() {
        this.messageDelimiter = '<<END>>';
    }

    textToBinary(text) {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('');
    }

    binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substring(i, i + 8);
            if (byte.length < 8) break;
            const charCode = parseInt(byte, 2);
            if (charCode === 0) break;
            text += String.fromCharCode(charCode);
        }
        return text;
    }

    async encodeMessage(imagePath, message) {
        try {
            const image = await Jimp.read(imagePath);
            const fullMessage = message + this.messageDelimiter;
            const binaryMessage = this.textToBinary(fullMessage);

            const maxCapacity = (image.bitmap.width * image.bitmap.height * 3);
            if (binaryMessage.length > maxCapacity) {
                throw new Error('Message is too long for this image');
            }

            let binaryIndex = 0;

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                if (binaryIndex >= binaryMessage.length) return;

                // Skip alpha channel, only use RGB
                for (let i = 0; i < 3 && binaryIndex < binaryMessage.length; i++) {
                    const colorValue = this.bitmap.data[idx + i];
                    const bit = parseInt(binaryMessage[binaryIndex]);
                    this.bitmap.data[idx + i] = (colorValue & 0xFE) | bit;
                    binaryIndex++;
                }
            });

            return image;
        } catch (error) {
            throw new Error(`Encoding failed: ${error.message}`);
        }
    }

    async decodeMessage(imagePath) {
        try {
            console.log('Reading image from path:', imagePath);
            const image = await Jimp.read(imagePath);
            console.log('Image dimensions:', image.bitmap.width, 'x', image.bitmap.height);
            
            let binaryMessage = '';

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                // Skip alpha channel, only use RGB (same as encoding)
                for (let i = 0; i < 3; i++) {
                    const colorValue = this.bitmap.data[idx + i];
                    binaryMessage += (colorValue & 1).toString();
                }
            });

            console.log('Extracted binary message length:', binaryMessage.length);
            console.log('First 100 bits:', binaryMessage.substring(0, 100));
            const decodedText = this.binaryToText(binaryMessage);
            console.log('Decoded text length:', decodedText.length);
            console.log('First 50 chars of decoded text:', decodedText.substring(0, 50).replace(/\0/g, '\\0'));
            
            const delimiterIndex = decodedText.indexOf(this.messageDelimiter);
            console.log('Looking for delimiter:', this.messageDelimiter);
            console.log('Delimiter index:', delimiterIndex);

            if (delimiterIndex === -1) {
                throw new Error('No hidden message found in this image');
            }

            const message = decodedText.substring(0, delimiterIndex);
            console.log('Final decoded message:', message);
            return message;
        } catch (error) {
            console.error('Steganography service decode error:', error);
            throw new Error(`Decoding failed: ${error.message}`);
        }
    }
}

export default new SteganographyService();
