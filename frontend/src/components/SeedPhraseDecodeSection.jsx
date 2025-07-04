import { useState } from 'react';
import axios from 'axios';

const SeedPhraseDecodeSection = () => {
  const [encryptedVideo, setEncryptedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState(null);
  const [extractedSeedPhrase, setExtractedSeedPhrase] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!encryptedVideo) {
      setError('Please select an encrypted video file');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('Starting decryption...');

    const formData = new FormData();
    formData.append('encrypted_video', encryptedVideo);

    try {
      // Start decryption
      const response = await axios.post('http://localhost:5000/api/decrypt', formData, {
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
            // Success - fetch extracted text
            try {
              const textResponse = await axios.get(`http://localhost:5000/api/text/${currentJobId}`);
              if (textResponse.data.success) {
                setExtractedSeedPhrase(textResponse.data.seed_phrase);
                setResult({
                  success: true,
                  jobId: currentJobId,
                  message: 'Seed phrase successfully extracted from video!'
                });
              } else {
                setError('Could not extract seed phrase text from image');
              }
            } catch (textErr) {
              console.error('Error fetching extracted text:', textErr);
              setError('Could not retrieve extracted seed phrase text');
            }
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
      setError(err.response?.data?.error || 'An error occurred during decryption');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`http://localhost:5000/api/download/${jobId}`, '_blank');
    }
  };

  const resetForm = () => {
    setEncryptedVideo(null);
    setIsLoading(false);
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError('');
    setJobId(null);
    setExtractedSeedPhrase(null);
  };

  const copyToClipboard = async () => {
    if (extractedSeedPhrase) {
      try {
        await navigator.clipboard.writeText(extractedSeedPhrase);
        alert('Seed phrase copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      }
    }
  };

  return (
    <div className="section">
      <h2>🔓 Extract Seed Phrase from Video</h2>
      <p>Extract a hidden seed phrase from an encrypted video file.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="encryptedVideo">
            🎥 Encrypted Video File
          </label>
          <input
            type="file"
            id="encryptedVideo"
            accept=".mp4,.avi,.mkv,.mov"
            onChange={(e) => setEncryptedVideo(e.target.files[0])}
            disabled={isLoading}
          />
          <small>Upload the video file containing the hidden seed phrase</small>
        </div>

        <button
          type="submit"
          disabled={isLoading || !encryptedVideo}
          className="submit-btn"
        >
          {isLoading ? '🔄 Processing...' : '🔓 Extract Seed Phrase'}
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

          {extractedSeedPhrase ? (
            <div className="seed-phrase-display">
              <h4>🔑 Extracted Seed Phrase:</h4>
              <div className="seed-phrase-text">
                {extractedSeedPhrase}
              </div>
              <div className="seed-phrase-actions">
                <button onClick={copyToClipboard} className="copy-btn">
                  📋 Copy to Clipboard
                </button>
                <button onClick={handleDownload} className="download-btn">
                  📥 Download Image (Backup)
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>Seed phrase extracted to image file. Download it to view your seed phrase.</p>
              <button onClick={handleDownload} className="download-btn">
                📥 Download Seed Phrase Image
              </button>
            </div>
          )}

          <button onClick={resetForm} className="reset-btn">
            🔄 Extract Another Seed Phrase
          </button>

          <div className="important-note">
            <h4>📝 Important:</h4>
            <ul>
              <li>Copy your seed phrase immediately and store it securely</li>
              <li>Verify the seed phrase carefully before using it</li>
              <li>Clear your clipboard after copying sensitive information</li>
              <li>Never share your seed phrase with anyone</li>
            </ul>
          </div>
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
          <li>The video is processed to extract hidden steganographic data</li>
          <li>The hidden seed phrase video is recovered using LSB extraction</li>
          <li>The first frame is extracted as an image containing the seed phrase</li>
          <li>The image shows your original seed phrase with checksum validation</li>
        </ul>

        <div className="warning">
          <h4>⚠️ Security Reminder</h4>
          <ul>
            <li>Only use videos that you know contain hidden seed phrases</li>
            <li>Always verify the extracted seed phrase matches your expectations</li>
            <li>If the extraction fails, the video may not contain a hidden seed phrase</li>
            <li>Keep extracted seed phrase files secure and delete them after use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeedPhraseDecodeSection;
