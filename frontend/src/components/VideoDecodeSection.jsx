import { useState } from 'react';
import axios from 'axios';

function VideoDecodeSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError('');
      setDecodedMessage('');
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleDecode = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setError('');
    setDecodedMessage('');
    setProgress('Processing video... This may take several minutes. Please be patient.');

    const formData = new FormData();
    formData.append('video', selectedFile);

    // Show animated progress
    let progressDots = 0;
    const progressInterval = setInterval(() => {
      progressDots = (progressDots + 1) % 4;
      const dots = '.'.repeat(progressDots);
      setProgress(`Analyzing video frames${dots} This process examines every pixel in the video and may take 3-5 minutes for longer videos. Please wait`);
    }, 1000);

    try {
      const response = await axios.post('/api/video-steganography/decode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minute timeout
      });

      clearInterval(progressInterval);
      setDecodedMessage(response.data.message);
      setProgress('✅ Video decoded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setProgress(''), 3000);
      
    } catch (err) {
      clearInterval(progressInterval);
      
      if (err.code === 'ECONNABORTED') {
        setError('Decoding timed out. This video may be too long or complex. Try with a shorter video.');
      } else {
        setError(err.response?.data?.error || 'Failed to decode message from video');
      }
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="input-group">
        <label htmlFor="decode-video">Select Video with Hidden Message:</label>
        <input
          id="decode-video"
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFile && (
          <p className="file-info">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {progress && !error && <div className="progress-message">{progress}</div>}

      <button
        onClick={handleDecode}
        disabled={loading}
        className="primary-button"
      >
        {loading ? 'Decoding Video...' : 'Decode Message'}
      </button>

      {decodedMessage && (
        <div className="result-section">
          <h3>Hidden Message:</h3>
          <div className="decoded-message">
            {decodedMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDecodeSection;