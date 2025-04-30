import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';

function App() {
  const version = '2.3.0'
  const [currentView, setCurrentView] = useState('catalog');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(6 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleVideoSelect = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setCurrentView('player');
    setTimerActive(true);
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setTimerActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerColor = timeLeft <= 5 * 60 ? 'text-red-500' : 'text-white';

  return (
    <div className="w-full h-full bg-black relative">
      <div className={`absolute top-[10px] left-1/2 transform -translate-x-1/2 ${timerColor} text-lg font-bold bg-black bg-opacity-70 px-4 py-1 rounded-full z-50 flex items-center gap-2`}>
        <i className="fa-solid fa-clock"></i>
        <span>{formatTime(timeLeft)}</span>
      </div>
      <div className='absolute top-[10px] right-[10px] text-white text-sm'>
        v{version}
      </div>
      {currentView === 'catalog' ? (
        <Catalog onVideoSelect={handleVideoSelect} />
      ) : (
        <VideoPlayer 
          url={currentVideo} 
          onBack={handleBackToCatalog}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
        />
      )}
    </div>
  );
}

export default App;