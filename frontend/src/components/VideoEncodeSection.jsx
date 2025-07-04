import { useState } from 'react';
import axios from 'axios';

function VideoEncodeSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [encodedVideoUrl, setEncodedVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleEncode = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message to encode');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Processing video... This may take a few moments.');

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('message', message);

    try {
      const response = await axios.post('/api/video-steganography/encode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEncodedVideoUrl(response.data.url);
      setProgress(`Successfully encoded message into ${response.data.framesUsed} frames`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to encode message in video');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (encodedVideoUrl) {
      const link = document.createElement('a');
      link.href = encodedVideoUrl;
      link.download = 'encoded-video.mp4';
      link.click();
    }
  };

  return (
    <div className="section-container">
      <div className="input-group">
        <label htmlFor="encode-video">Select Video:</label>
        <input
          id="encode-video"
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

      <div className="input-group">
        <label htmlFor="video-message">Secret Message:</label>
        <textarea
          id="video-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your secret message here..."
          rows={4}
          className="message-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {progress && !error && <div className="progress-message">{progress}</div>}

      <button
        onClick={handleEncode}
        disabled={loading}
        className="primary-button"
      >
        {loading ? 'Encoding Video...' : 'Encode Message'}
      </button>

      {encodedVideoUrl && (
        <div className="result-section">
          <h3>Encoded Video:</h3>
          <video 
            controls 
            className="result-video"
            src={encodedVideoUrl}
          >
            Your browser does not support the video tag.
          </video>
          <button onClick={handleDownload} className="secondary-button">
            Download Video
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoEncodeSection;