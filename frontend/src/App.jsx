import { useState } from 'react';
import './App.css';
import EncodeSection from './components/EncodeSection';
import DecodeSection from './components/DecodeSection';
import VideoEncodeSection from './components/VideoEncodeSection';
import VideoDecodeSection from './components/VideoDecodeSection';
import SeedPhraseEncodeSection from './components/SeedPhraseEncodeSection';
import SeedPhraseDecodeSection from './components/SeedPhraseDecodeSection';

function App() {
  const [activeTab, setActiveTab] = useState('encode');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Steganography Service</h1>
        <p>Hide and reveal secret messages in images and videos</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'encode' ? 'active' : ''}`}
          onClick={() => setActiveTab('encode')}
        >
          Encode Image
        </button>
        <button
          className={`tab ${activeTab === 'decode' ? 'active' : ''}`}
          onClick={() => setActiveTab('decode')}
        >
          Decode Image
        </button>
        <button
          className={`tab ${activeTab === 'video-encode' ? 'active' : ''}`}
          onClick={() => setActiveTab('video-encode')}
        >
          Encode Video
        </button>
        <button
          className={`tab ${activeTab === 'video-decode' ? 'active' : ''}`}
          onClick={() => setActiveTab('video-decode')}
        >
          Decode Video
        </button>
        <button
          className={`tab ${activeTab === 'seedphrase-encode' ? 'active' : ''}`}
          onClick={() => setActiveTab('seedphrase-encode')}
        >
          🔐 Hide Seed Phrase
        </button>
        <button
          className={`tab ${activeTab === 'seedphrase-decode' ? 'active' : ''}`}
          onClick={() => setActiveTab('seedphrase-decode')}
        >
          🔓 Extract Seed Phrase
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'encode' && <EncodeSection />}
        {activeTab === 'decode' && <DecodeSection />}
        {activeTab === 'video-encode' && <VideoEncodeSection />}
        {activeTab === 'video-decode' && <VideoDecodeSection />}
        {activeTab === 'seedphrase-encode' && <SeedPhraseEncodeSection />}
        {activeTab === 'seedphrase-decode' && <SeedPhraseDecodeSection />}
      </main>
    </div>
  );
}

export default App;
