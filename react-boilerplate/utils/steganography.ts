export const MESSAGE_DELIMITER = "<<END>>";

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function drawToCanvas(image: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    return { canvas, ctx };
}

function textToBinary(text: string): string {
    return text
        .split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");
}

function binaryToText(binary: string): string {
    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substr(i, 8);
        if (byte.length < 8) break;
        const charCode = parseInt(byte, 2);
        if (charCode === 0) break;
        text += String.fromCharCode(charCode);
    }
    return text;
}

export async function encodeMessageIntoImage(source: File | Blob, message: string): Promise<string> {
    if (!message || !message.trim()) {
        throw new Error("No message provided to encode");
    }

    const withDelimiter = `${message}${MESSAGE_DELIMITER}`;
    const image = await loadImageFromBlob(source);
    const { canvas, ctx } = drawToCanvas(image);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const binaryMessage = textToBinary(withDelimiter);

    // Capacity: we encode 3 bits per pixel (RGB)
    const maxCapacityBits = (data.length / 4) * 3;
    if (binaryMessage.length > maxCapacityBits) {
        throw new Error("Message is too long for this image");
    }

    let binaryIndex = 0;
    for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
        for (let j = 0; j < 3 && binaryIndex < binaryMessage.length; j++) {
            const bit = parseInt(binaryMessage[binaryIndex]);
            data[i + j] = (data[i + j] & 0xFE) | bit;
            binaryIndex++;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
}

export async function decodeMessageFromImage(source: File | Blob): Promise<string> {
    const image = await loadImageFromBlob(source);
    const { canvas, ctx } = drawToCanvas(image);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let binaryMessage = "";
    for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            binaryMessage += (data[i + j] & 1).toString();
        }
    }

    const message = binaryToText(binaryMessage);
    const delimiterIndex = message.indexOf(MESSAGE_DELIMITER);
    if (delimiterIndex === -1) {
        throw new Error("No hidden message found in this image");
    }

    return message.substring(0, delimiterIndex);
}


