import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';

function App() {
  const version = 'v3.0.0';
  const [currentView, setCurrentView] = useState('catalog');
  const [currentVideo, setCurrentVideo] = useState({ url: null, cover: null });
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userType, setUserType] = useState('');
  
  const [filterMode, setFilterMode] = useState('v'); // v, m, r
  const [languageMode, setLanguageMode] = useState('t'); // es, en, t

  const checkForNewDayReset = () => {
    const savedTimeLimit = localStorage.getItem('timeLimit');
    const lastResetDate = localStorage.getItem('lastResetDate');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    const savedUserType = localStorage.getItem('userType');
    const savedFilterMode = localStorage.getItem('filterMode');
    const savedLanguageMode = localStorage.getItem('languageMode');
    
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      const newTimeLimit = savedTimeLimit ? parseInt(savedTimeLimit) * 60 : 30 * 60;
      setTimeLeft(newTimeLimit);
      localStorage.setItem('lastResetDate', today);
      localStorage.setItem('timeLeft', newTimeLimit.toString());
    } else if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft));
    }

    if (savedUserType) {
      setUserType(savedUserType);
    }
    if (savedFilterMode) {
      setFilterMode(savedFilterMode);
    }
    if (savedLanguageMode) {
      setLanguageMode(savedLanguageMode);
    }
  };

  useEffect(() => {
    checkForNewDayReset();
    const interval = setInterval(checkForNewDayReset, 3600000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForNewDayReset();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  const handleVideoSelect = (videoUrl, videoCover) => {
    if (timeLeft > 0) {
      setCurrentVideo({ url: videoUrl, cover: videoCover });
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

  const handleSecretConfig = () => {
    const input = prompt(`Ingrese:
- Número de minutos disponibles
- "v" para modo Videos
- "m" para modo Música
- "r" para modo Radio
- "es" para idioma Español
- "en" para idioma Inglés
- "t" para Todos los idiomas
- "e" para usuario Ethan
- "l" para usuario normal`);

    if (input === null) return;

    const trimmedInput = input.trim().toLowerCase();

    if (!isNaN(trimmedInput) && trimmedInput !== '') {
      const minutes = parseInt(trimmedInput);
      if (minutes > 0) {
        const newTimeInSeconds = minutes * 60;
        setTimeLeft(newTimeInSeconds);
        localStorage.setItem('timeLimit', minutes.toString());
        localStorage.setItem('timeLeft', newTimeInSeconds.toString());
        const today = new Date().toDateString();
        localStorage.setItem('lastResetDate', today);
      }
    } 
    else if (['v', 'm', 'r'].includes(trimmedInput)) {
      setFilterMode(trimmedInput);
      localStorage.setItem('filterMode', trimmedInput);
    }
    else if (['es', 'en', 't'].includes(trimmedInput)) {
      setLanguageMode(trimmedInput);
      localStorage.setItem('languageMode', trimmedInput);
    }
    else if (trimmedInput === 'e' || trimmedInput === 'l') {
      setUserType(trimmedInput);
      localStorage.setItem('userType', trimmedInput);
    }
  };

  const timerColor = timeLeft <= 5 * 60 ? 'text-red-500' : 'text-white';

  const getFilterColor = (mode) => {
    switch (mode) {
      case 'v': return 'bg-blue-500 text-white';
      case 'm': return 'bg-orange-500 text-white';
      case 'r': return 'bg-purple-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getFilterText = (mode) => {
    switch (mode) {
      case 'v': return 'VIDEOS';
      case 'm': return 'MÚSICA';
      case 'r': return 'RADIO';
      default: return 'VIDEOS';
    }
  };

  const getLanguageColor = (mode) => {
    switch (mode) {
      case 'es': return 'bg-green-500 text-white';
      case 'en': return 'bg-red-500 text-white';
      case 't': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLanguageText = (mode) => {
    switch (mode) {
      case 'es': return 'ES';
      case 'en': return 'EN';
      case 't': return 'TODOS';
      default: return 'TODOS';
    }
  };

  return (
    <div className="w-full h-full bg-black relative">
      <button 
        onClick={handleSecretConfig}
        className="absolute top-[0] left-[0] bg-black z-[60] w-[23px] h-[50px]"
      ></button>

      <div className={`absolute top-[10px] left-1/2 transform -translate-x-1/2 ${timerColor} text-lg font-bold bg-black bg-opacity-70 px-4 py-1 rounded-full z-50 flex items-center gap-2`}>
        <i className="fa-solid fa-clock"></i>
        <span>{formatTime(timeLeft)}</span>
        <span className={`${getLanguageColor(languageMode)} px-2 py-1 rounded text-xs font-bold`}>
          {getLanguageText(languageMode)}
        </span>
        <span className={`${getFilterColor(filterMode)} px-2 py-1 rounded text-xs font-bold`}>
          {getFilterText(filterMode)}
        </span>
      </div>

      <div className='absolute top-[10px] right-[30px] text-white text-sm'>
        v{version}
      </div>

      {currentView === 'catalog' ? (
        <Catalog 
          onVideoSelect={handleVideoSelect} 
          userType={userType}
          filterMode={filterMode}
          languageMode={languageMode}
        />
      ) : (
        <VideoPlayer 
          url={currentVideo.url}
          videoCover={currentVideo.cover}
          onBack={handleBackToCatalog}
          timeLeft={timeLeft}
          setIsTimerRunning={setIsTimerRunning}
          filterMode={filterMode}
        />
      )}
    </div>
  );
}

export default App;