import { useState } from 'react';
import axios from 'axios';

function DecodeSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
      setDecodedMessage('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDecode = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');
    setDecodedMessage('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/steganography/decode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDecodedMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to decode message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="input-group">
        <label htmlFor="decode-image">Select Image with Hidden Message:</label>
        <input
          id="decode-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFile && (
          <p className="file-info">Selected: {selectedFile.name}</p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleDecode}
        disabled={loading}
        className="primary-button"
      >
        {loading ? 'Decoding...' : 'Decode Message'}
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

export default DecodeSection;
