import { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';

function App() {
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' o 'player'
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleVideoSelect = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setCurrentView('player');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden touch-none bg-black">
      {currentView === 'catalog' ? (
        <Catalog onVideoSelect={handleVideoSelect} />
      ) : (
        <VideoPlayer 
          url={currentVideo} 
          onBack={handleBackToCatalog} 
        />
      )}
    </div>
  );
}

export default App;