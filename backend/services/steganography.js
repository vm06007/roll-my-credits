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
            const byte = binary.substr(i, 8);
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
            const image = await Jimp.read(imagePath);
            let binaryMessage = '';

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                for (let i = 0; i < 3; i++) {
                    const colorValue = this.bitmap.data[idx + i];
                    binaryMessage += (colorValue & 1).toString();
                }
            });

            const decodedText = this.binaryToText(binaryMessage);
            const delimiterIndex = decodedText.indexOf(this.messageDelimiter);

            if (delimiterIndex === -1) {
                throw new Error('No hidden message found in this image');
            }

            return decodedText.substring(0, delimiterIndex);
        } catch (error) {
            throw new Error(`Decoding failed: ${error.message}`);
        }
    }
}

export default new SteganographyService();
