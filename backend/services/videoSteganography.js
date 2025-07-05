import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs/promises';
import Jimp from 'jimp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

class VideoSteganographyService {
  constructor() {
    this.messageDelimiter = 'END';
    this.tempDir = join(dirname(__dirname), 'temp');
    this.logFile = join(dirname(__dirname), 'video-stego-debug.log');
    this.ensureTempDir();
  }

  async log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    await fs.appendFile(this.logFile, logEntry).catch(e => console.error('Log error:', e));
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  textToBinary(text) {
    // Use a more robust encoding with redundancy
    let binary = '';
    for (let char of text) {
      let charBinary = char.charCodeAt(0).toString(2).padStart(8, '0');
      // Repeat each bit 3 times for error correction
      for (let bit of charBinary) {
        binary += bit.repeat(3);
      }
    }
    return binary;
  }

  binaryToText(binary) {
    let text = '';
    // Process groups of 24 bits (8 bits × 3 repetitions)
    for (let i = 0; i < binary.length; i += 24) {
      const group = binary.substr(i, 24);
      if (group.length < 24) break;

      let charBinary = '';
      // Decode each bit using majority voting
      for (let j = 0; j < 24; j += 3) {
        const triplet = group.substr(j, 3);
        const ones = (triplet.match(/1/g) || []).length;
        charBinary += ones >= 2 ? '1' : '0';
      }

      const charCode = parseInt(charBinary, 2);
      if (charCode === 0) break;
      text += String.fromCharCode(charCode);
    }
    return text;
  }

  async extractFrames(videoPath, outputDir) {
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions(['-q:v 1'])
        .output(path.join(outputDir, 'frame_%04d.png'))
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }

  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          resolve({
            fps: eval(videoStream.r_frame_rate),
            duration: metadata.format.duration,
            width: videoStream.width,
            height: videoStream.height,
            codec: videoStream.codec_name
          });
        }
      });
    });
  }

  async embedMessageInFrame(framePath, binaryMessage, startIndex) {
    const image = await Jimp.read(framePath);

    let binaryIndex = 0;
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Use only the last line of pixels (height - 1)
    const lastLineY = height - 1;
    const maxBits = Math.min(binaryMessage.length - startIndex, width);

    // Use more robust encoding - modify multiple bits for compression resilience
    for (let x = 0; x < width && binaryIndex < maxBits; x++) {
      const idx = (lastLineY * width + x) * 4; // RGBA, so multiply by 4
      const bit = parseInt(binaryMessage[startIndex + binaryIndex]);

      if (bit) {
        // For bit 1: Set pixel to bright value (240) to survive compression
        image.bitmap.data[idx] = 240;     // Red
        image.bitmap.data[idx + 1] = 240; // Green
        image.bitmap.data[idx + 2] = 240; // Blue
      } else {
        // For bit 0: Set pixel to dark value (15) to survive compression
        image.bitmap.data[idx] = 15;      // Red
        image.bitmap.data[idx + 1] = 15;  // Green
        image.bitmap.data[idx + 2] = 15;  // Blue
      }

      binaryIndex++;
    }

    await image.writeAsync(framePath);

    return binaryIndex;
  }

  async extractMessageFromFrame(framePath) {
    const image = await Jimp.read(framePath);

    let binaryMessage = '';
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Use only the last line of pixels (height - 1)
    const lastLineY = height - 1;

    // Extract using brightness threshold (compatible with compression)
    for (let x = 0; x < width; x++) {
      const idx = (lastLineY * width + x) * 4; // RGBA, so multiply by 4
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];

      // Calculate brightness
      const brightness = (r + g + b) / 3;

      // Use threshold to determine bit (bright = 1, dark = 0)
      binaryMessage += brightness > 127 ? '1' : '0';

      // Check if we have enough bits to decode and look for delimiter
      if (binaryMessage.length >= 24 && binaryMessage.length % 24 === 0) {
        const currentText = this.binaryToText(binaryMessage);
        if (currentText.includes(this.messageDelimiter)) {
          // Found the delimiter, stop extracting
          break;
        }
      }
    }

    await this.log(`Extracted from frame`, {
      framePath: framePath.split('/').pop(),
      bitsExtracted: binaryMessage.length,
      pixelCount: width,
      lastLineY
    });
    return binaryMessage;
  }

  async createVideoFromFrames(framesDir, outputPath, fps) {
    return new Promise((resolve, reject) => {
      // Use VP9 lossless for web compatibility and data preservation
      ffmpeg()
        .input(path.join(framesDir, 'frame_%04d.png'))
        .inputFPS(fps)
        .outputOptions([
          '-c:v libvpx-vp9',    // VP9 codec for web compatibility
          '-lossless 1',        // Enable lossless mode
          '-pix_fmt yuv444p',   // Full chroma sampling
          '-deadline best',     // Best quality
          '-cpu-used 0'         // Slowest/highest quality
        ])
        .toFormat('webm')       // WebM container for VP9
        .output(outputPath.replace('.mp4', '.webm').replace('.avi', '.webm').replace('.mkv', '.webm').replace('.mov', '.webm'))
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }

  async encodeMessage(videoPath, message) {
    const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const framesDir = path.join(this.tempDir, `frames-${sessionId}`);
    const outputPath = path.join(dirname(__dirname), 'output', `encoded-video-${sessionId}.webm`);

    await this.log(`Starting encode - Message: "${message}", Session: ${sessionId}`);

    try {
      const metadata = await this.getVideoMetadata(videoPath);
      await this.log('Video metadata:', metadata);

      await this.extractFrames(videoPath, framesDir);

      const frameFiles = await fs.readdir(framesDir);
      const sortedFrames = frameFiles.sort();

      // Split message into chunks (1 character per frame with high redundancy)
      const charsPerFrame = 1;
      const redundancyFactor = 10; // Store each character in 10 frames for very high reliability with sparse pixels
      const messageChunks = [];
      for (let i = 0; i < message.length; i += charsPerFrame) {
        messageChunks.push(message.substring(i, i + charsPerFrame));
      }

      const totalChunks = messageChunks.length;
      const framesNeeded = totalChunks * redundancyFactor;

      if (framesNeeded > sortedFrames.length) {
        throw new Error(`Message too long: needs ${framesNeeded} frames (${totalChunks} chars × ${redundancyFactor} redundancy) but video only has ${sortedFrames.length} frames. Try a longer video or shorter message.`);
      }

      console.log(`Encoding "${message}" (${message.length} chars) using ${framesNeeded} frames (${redundancyFactor}x redundancy) out of ${sortedFrames.length} available`);

      // Distribute frames more evenly across the video instead of clustering at end
      const frameStep = Math.max(1, Math.floor(sortedFrames.length / framesNeeded));
      const framesToEncode = [];

      for (let i = 0; i < framesNeeded; i++) {
        const frameIndex = Math.min(i * frameStep, sortedFrames.length - 1);
        framesToEncode.push(sortedFrames[frameIndex]);
      }

      let frameCount = 0;

      for (let i = 0; i < messageChunks.length; i++) {
        const chunk = messageChunks[i];

        // Store the same character in multiple non-consecutive frames
        for (let r = 0; r < redundancyFactor; r++) {
          const frameMessage = `${i}|${totalChunks}|${chunk}${this.messageDelimiter}`;
          const binaryMessage = this.textToBinary(frameMessage);

          const frameIndex = i * redundancyFactor + r;
          const framePath = path.join(framesDir, framesToEncode[frameIndex]);

          await this.log(`Encoding char ${i} ("${chunk}") into frame ${framesToEncode[frameIndex]}`, {
            frameIndex,
            frameMessage,
            binaryLength: binaryMessage.length,
            binaryPreview: binaryMessage.substring(0, 50)
          });

          await this.embedMessageInFrame(framePath, binaryMessage, 0);
          frameCount++;
        }
      }

      await this.createVideoFromFrames(framesDir, outputPath, metadata.fps);

      await fs.rm(framesDir, { recursive: true, force: true });

      return {
        filename: `encoded-video-${sessionId}.webm`,
        framesUsed: frameCount,
        totalFrames: sortedFrames.length,
        messageLength: message.length,
        chunksUsed: totalChunks
      };

    } catch (error) {
      await fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }

  async decodeMessage(videoPath) {
    const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const framesDir = path.join(this.tempDir, `frames-${sessionId}`);

    await this.log(`Starting decode - Session: ${sessionId}`);

    try {
      await this.extractFrames(videoPath, framesDir);

      const frameFiles = await fs.readdir(framesDir);
      const sortedFrames = frameFiles.sort();

      // Process frames in forward order (same as encoding)
      const framesToCheck = sortedFrames; // Don't reverse - check in encoding order

      const messageChunks = new Map(); // charIndex -> [chunks from different frames]
      let totalCharsExpected = null;
      let foundFrames = 0;

      // Check ALL frames to find all message chunks
      const frameCount = framesToCheck.length;

      for (let i = 0; i < frameCount; i++) {
        const frameName = framesToCheck[i];
        const framePath = path.join(framesDir, frameName);
        const frameBinary = await this.extractMessageFromFrame(framePath);

        const frameText = this.binaryToText(frameBinary);

        if (frameText.includes(this.messageDelimiter)) {
          await this.log(`Found delimiter in frame ${frameName}`, {
            frameBinary: frameBinary.substring(0, 100),
            frameText,
            delimiterFound: true
          });
          // Parse the frame message: charIndex|totalChars|char|delimiter
          const delimiterIndex = frameText.indexOf(this.messageDelimiter);
          const frameMessage = frameText.substring(0, delimiterIndex);

          const parts = frameMessage.split('|');
          if (parts.length >= 3) {
            const charIndex = parseInt(parts[0]);
            const totalChars = parseInt(parts[1]);
            const char = parts.slice(2).join('|'); // In case char contains '|'

            if (!isNaN(charIndex) && !isNaN(totalChars)) {
              // Store multiple versions of each character
              if (!messageChunks.has(charIndex)) {
                messageChunks.set(charIndex, []);
              }
              messageChunks.get(charIndex).push(char);

              totalCharsExpected = totalChars;
              foundFrames++;
            }
          }
        }
      }

      await fs.rm(framesDir, { recursive: true, force: true });

      if (foundFrames === 0 || totalCharsExpected === null) {
        await this.log('No hidden message found', {
          foundFrames,
          totalCharsExpected,
          frameCount,
          messageChunksSize: messageChunks.size
        });
        throw new Error('No hidden message found in this video');
      }

      console.log(`Found ${foundFrames} frames for ${totalCharsExpected} characters`);

      // Reconstruct the message using redundancy (majority voting for each character)
      let fullMessage = '';
      let missingChars = [];

      for (let i = 0; i < totalCharsExpected; i++) {
        if (messageChunks.has(i) && messageChunks.get(i).length > 0) {
          const versions = messageChunks.get(i);
          // Use the most common version (majority voting)
          const charCounts = {};
          for (const char of versions) {
            charCounts[char] = (charCounts[char] || 0) + 1;
          }
          const bestChar = Object.keys(charCounts).reduce((a, b) =>
            charCounts[a] > charCounts[b] ? a : b
          );
          fullMessage += bestChar;
        } else {
          missingChars.push(i);
          fullMessage += '?'; // Placeholder for missing character
        }
      }

      if (missingChars.length > 0) {
        console.log(`Warning: Missing characters at positions: ${missingChars.join(', ')}`);
        console.log(`Recovered message with placeholders: "${fullMessage}"`);
      }

      return fullMessage;

    } catch (error) {
      await fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }
}

export default new VideoSteganographyService();