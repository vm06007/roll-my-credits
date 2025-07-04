import { useState } from 'react';
import axios from 'axios';

function EncodeSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [encodedImageUrl, setEncodedImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleEncode = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message to encode');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('message', message);

    try {
      const response = await axios.post('/api/steganography/encode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEncodedImageUrl(response.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to encode message');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (encodedImageUrl) {
      const link = document.createElement('a');
      link.href = encodedImageUrl;
      link.download = 'encoded-image.png';
      link.click();
    }
  };

  return (
    <div className="section-container">
      <div className="input-group">
        <label htmlFor="encode-image">Select Image:</label>
        <input
          id="encode-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFile && (
          <p className="file-info">Selected: {selectedFile.name}</p>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="message">Secret Message:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your secret message here..."
          rows={4}
          className="message-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleEncode}
        disabled={loading}
        className="primary-button"
      >
        {loading ? 'Encoding...' : 'Encode Message'}
      </button>

      {encodedImageUrl && (
        <div className="result-section">
          <h3>Encoded Image:</h3>
          <img 
            src={encodedImageUrl} 
            alt="Encoded" 
            className="result-image"
          />
          <button onClick={handleDownload} className="secondary-button">
            Download Image
          </button>
        </div>
      )}
    </div>
  );
}

export default EncodeSection;