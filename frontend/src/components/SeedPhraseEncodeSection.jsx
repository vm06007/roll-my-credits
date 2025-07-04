import { useState } from 'react';
import axios from 'axios';

const SeedPhraseEncodeSection = () => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [coverVideo, setCoverVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState(null);

  const wordCount = seedPhrase.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!seedPhrase.trim()) {
      setError('Please enter a seed phrase');
      return;
    }

    if (wordCount !== 12 && wordCount !== 24) {
      setError('Seed phrase must be exactly 12 or 24 words');
      return;
    }

    if (!coverVideo) {
      setError('Please select a cover video');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('Starting encryption...');

    const formData = new FormData();
    formData.append('seed_phrase', seedPhrase.trim());
    formData.append('cover_video', coverVideo);

    try {
      // Start encryption
      const response = await axios.post('http://localhost:5000/api/encrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const currentJobId = response.data.job_id;
      setJobId(currentJobId);

      // Poll for progress
      const pollProgress = async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:5000/api/status/${currentJobId}`);
          const { progress: currentProgress, message } = statusResponse.data;

          setProgress(currentProgress);
          setProgressMessage(message);

          if (currentProgress === 100) {
            // Success - show download option
            setResult({
              success: true,
              jobId: currentJobId,
              message: 'Seed phrase successfully hidden in video!'
            });
            setIsLoading(false);
          } else if (currentProgress === -1) {
            // Error
            setError(message);
            setIsLoading(false);
          } else {
            // Continue polling
            setTimeout(pollProgress, 1000);
          }
        } catch (err) {
          console.error('Error polling status:', err);
          setTimeout(pollProgress, 2000); // Retry with longer delay
        }
      };

      // Start polling after a short delay
      setTimeout(pollProgress, 500);

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'An error occurred during encryption');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`http://localhost:5000/api/download/${jobId}`, '_blank');
    }
  };

  const resetForm = () => {
    setSeedPhrase('');
    setCoverVideo(null);
    setIsLoading(false);
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError('');
    setJobId(null);
  };

  return (
    <div className="section">
      <h2>🔐 Hide Seed Phrase in Video</h2>
      <p>Hide your 12 or 24-word seed phrase securely inside a cover video using steganography.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="seedPhrase">
            🔑 Seed Phrase ({wordCount} words)
          </label>
          <textarea
            id="seedPhrase"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            placeholder="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
            disabled={isLoading}
            className={wordCount === 12 || wordCount === 24 ? 'valid' : wordCount > 0 ? 'invalid' : ''}
          />
          <small className={`word-count ${wordCount === 12 || wordCount === 24 ? 'valid' : wordCount > 0 ? 'invalid' : ''}`}>
            {wordCount} words {wordCount === 12 || wordCount === 24 ? '✓' : wordCount > 0 ? '(must be 12 or 24)' : ''}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="coverVideo">
            🎥 Cover Video
          </label>
          <input
            type="file"
            id="coverVideo"
            accept=".mp4,.avi,.mkv,.mov"
            onChange={(e) => setCoverVideo(e.target.files[0])}
            disabled={isLoading}
          />
          <small>Supported formats: MP4, AVI, MKV, MOV</small>
        </div>

        <button
          type="submit"
          disabled={isLoading || wordCount === 0 || (wordCount !== 12 && wordCount !== 24) || !coverVideo}
          className="submit-btn"
        >
          {isLoading ? '🔄 Processing...' : '🔐 Hide Seed Phrase'}
        </button>
      </form>

      {isLoading && (
        <div className="progress-section">
          <h3>📊 Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(0, progress)}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {progressMessage} ({progress}%)
          </div>
        </div>
      )}

      {result && result.success && (
        <div className="result-section success">
          <h3>✅ Success!</h3>
          <p>{result.message}</p>
          <button onClick={handleDownload} className="download-btn">
            📥 Download Encrypted Video
          </button>
          <button onClick={resetForm} className="reset-btn">
            🔄 Hide Another Seed Phrase
          </button>
        </div>
      )}

      {error && (
        <div className="result-section error">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={resetForm} className="reset-btn">
            🔄 Try Again
          </button>
        </div>
      )}

      <div className="info-section">
        <h3>ℹ️ How it works</h3>
        <ul>
          <li>Your seed phrase is converted to an image with checksum validation</li>
          <li>The image is converted to a video with silent audio</li>
          <li>The seed phrase video is hidden inside your cover video using LSB steganography</li>
          <li>The result looks like a normal video but contains your hidden seed phrase</li>
        </ul>

        <div className="warning">
          <h4>⚠️ Security Notes</h4>
          <ul>
            <li>Keep the encrypted video file safe - it contains your seed phrase</li>
            <li>Always verify the extracted seed phrase before using it</li>
            <li>This tool is for educational/demonstration purposes</li>
            <li>For production use, implement additional security measures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeedPhraseEncodeSection;
