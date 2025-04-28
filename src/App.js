import { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';

function App() {
  const version = '2.1.1'
  const [currentView, setCurrentView] = useState('catalog');
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleVideoSelect = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setCurrentView('player');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
  };

  return (
    <div className="w-full h-full bg-black">
      <div className='absolute top-[10px] right-[40px] text-white text-sm'>v{version}</div>
      {currentView === 'catalog' ? (
        <Catalog onVideoSelect={handleVideoSelect} />
      ) : (
        <VideoPlayer url={currentVideo} onBack={handleBackToCatalog} />
      )}
    </div>
  );
}

export default App;