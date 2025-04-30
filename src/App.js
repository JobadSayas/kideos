import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';

function App() {
  const version = '2.3.1';
  const [currentView, setCurrentView] = useState('catalog');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customTime, setCustomTime] = useState(45);

  // Función para verificar y resetear el tiempo si es un nuevo día
  const checkForNewDayReset = () => {
    const savedTimeLimit = localStorage.getItem('timeLimit');
    const lastResetDate = localStorage.getItem('lastResetDate');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      const newTimeLimit = savedTimeLimit ? parseInt(savedTimeLimit) * 60 : 30 * 60;
      setTimeLeft(newTimeLimit);
      setCustomTime(savedTimeLimit ? parseInt(savedTimeLimit) : 45);
      localStorage.setItem('lastResetDate', today);
      localStorage.setItem('timeLeft', newTimeLimit.toString());
    } else if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft));
    }
  };

  // Initialize and set up day change checks
  useEffect(() => {
    // Verificación inicial al cargar
    checkForNewDayReset();

    // Verificar cada hora (3600000 ms = 1 hora)
    const interval = setInterval(checkForNewDayReset, 3600000);

    // Event listener para cuando el usuario regresa a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewDayReset();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Timer logic - now controlled by VideoPlayer
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          localStorage.setItem('timeLeft', newTime.toString());
          return newTime;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsTimerRunning(false);
      localStorage.setItem('timeLeft', '0');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleVideoSelect = (videoUrl) => {
    if (timeLeft > 0) {
      setCurrentVideo(videoUrl);
      setCurrentView('player');
    }
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimeConfig = () => {
    const newTime = prompt('Set time limit (minutes):', customTime);
    if (newTime && !isNaN(newTime)) {
      const minutes = parseInt(newTime);
      if (minutes > 0) {
        setCustomTime(minutes);
        const newTimeLeft = minutes * 60;
        setTimeLeft(newTimeLeft);
        localStorage.setItem('timeLimit', minutes.toString());
        localStorage.setItem('timeLeft', newTimeLeft.toString());
        
        // Reset daily tracking
        const today = new Date().toDateString();
        localStorage.setItem('lastResetDate', today);
      }
    }
  };

  const timerColor = timeLeft <= 5 * 60 ? 'text-red-500' : 'text-white';

  return (
    <div className="w-full h-full bg-black relative">
      {/* Time Config Button */}
      <button 
        onClick={handleTimeConfig}
        className="absolute top-[0] left-[0] bg-black z-[60] w-[23px] h-[50px] bg-black"
      ></button>

      {/* Timer Display */}
      <div className={`absolute top-[10px] left-1/2 transform -translate-x-1/2 ${timerColor} text-lg font-bold bg-black bg-opacity-70 px-4 py-1 rounded-full z-50 flex items-center gap-2`}>
        <i className="fa-solid fa-clock"></i>
        <span>{formatTime(timeLeft)}</span>
      </div>

      {/* Version Info */}
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
          setIsTimerRunning={setIsTimerRunning}
        />
      )}
    </div>
  );
}

export default App;