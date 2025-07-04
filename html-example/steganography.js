class Steganography {
    constructor() {
        this.messageDelimiter = '<<END>>';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('encodeBtn').addEventListener('click', () => this.encodeMessage());
        document.getElementById('decodeBtn').addEventListener('click', () => this.decodeMessage());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
    }

    async encodeMessage() {
        const imageInput = document.getElementById('imageInput');
        const messageInput = document.getElementById('messageInput');

        if (!imageInput.files[0]) {
            alert('Please select an image file');
            return;
        }

        if (!messageInput.value.trim()) {
            alert('Please enter a message to hide');
            return;
        }

        const file = imageInput.files[0];
        const message = messageInput.value + this.messageDelimiter;

        try {
            const image = await this.loadImage(file);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const binaryMessage = this.textToBinary(message);

            if (binaryMessage.length > data.length / 4) {
                alert('Message is too long for this image');
                return;
            }

            let binaryIndex = 0;
            for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
                for (let j = 0; j < 3 && binaryIndex < binaryMessage.length; j++) {
                    data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryMessage[binaryIndex]);
                    binaryIndex++;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const encodedImage = document.getElementById('encodedImage');
            encodedImage.src = canvas.toDataURL('image/png');
            document.getElementById('encodeResult').style.display = 'block';

        } catch (error) {
            alert('Error encoding message: ' + error.message);
        }
    }

    async decodeMessage() {
        const decodeImageInput = document.getElementById('decodeImageInput');

        if (!decodeImageInput.files[0]) {
            alert('Please select an image file');
            return;
        }

        const file = decodeImageInput.files[0];

        try {
            const image = await this.loadImage(file);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let binaryMessage = '';
            for (let i = 0; i < data.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    binaryMessage += (data[i + j] & 1).toString();
                }
            }

            const message = this.binaryToText(binaryMessage);
            const delimiterIndex = message.indexOf(this.messageDelimiter);

            if (delimiterIndex === -1) {
                alert('No hidden message found in this image');
                return;
            }

            const hiddenMessage = message.substring(0, delimiterIndex);
            document.getElementById('decodedMessage').textContent = hiddenMessage;
            document.getElementById('decodeResult').style.display = 'block';

        } catch (error) {
            alert('Error decoding message: ' + error.message);
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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

    downloadImage() {
        const encodedImage = document.getElementById('encodedImage');
        const link = document.createElement('a');
        link.download = 'steganography_encoded.png';
        link.href = encodedImage.src;
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Steganography();
});
