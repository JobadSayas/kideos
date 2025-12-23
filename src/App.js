import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/Catalog';
import NewEditPopup from './components/NewEditPopup'; // Nuevo import

function App() {
  const version = 'v4.1.0';
  const [currentView, setCurrentView] = useState('catalog');
  const [currentVideo, setCurrentVideo] = useState({ url: null, cover: null });
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userType, setUserType] = useState('');
  
  // AHORA SÍ mantenemos estados locales para forzar re-render
  const [filterMode, setFilterMode] = useState(() => localStorage.getItem('filterMode') || 'v');
  const [languageMode, setLanguageMode] = useState(() => localStorage.getItem('languageMode') || 't');
  const [debugMode, setDebugMode] = useState(() => localStorage.getItem('debugMode') === 'true');
  
  // Estados para el popup de nuevo/editar video
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoPopupMode, setVideoPopupMode] = useState('new'); // 'new' o 'edit'
  const [videoPopupData, setVideoPopupData] = useState(null); // Datos del video para editar

  const checkForNewDayReset = () => {
    const savedTimeLimit = localStorage.getItem('timeLimit');
    const lastResetDate = localStorage.getItem('lastResetDate');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    const savedUserType = localStorage.getItem('userType');
    
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

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'filterMode') {
        const newValue = localStorage.getItem('filterMode') || 'v';
        if (newValue !== filterMode) {
          setFilterMode(newValue);
        }
      } else if (e.key === 'languageMode') {
        const newValue = localStorage.getItem('languageMode') || 't';
        if (newValue !== languageMode) {
          setLanguageMode(newValue);
        }
      } else if (e.key === 'debugMode') {
        const newValue = localStorage.getItem('debugMode') === 'true';
        if (newValue !== debugMode) {
          setDebugMode(newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar nuestro propio evento custom
    const handleCustomStorageChange = () => {
      // Re-leer todos los valores de localStorage
      const newFilterMode = localStorage.getItem('filterMode') || 'v';
      const newLanguageMode = localStorage.getItem('languageMode') || 't';
      const newDebugMode = localStorage.getItem('debugMode') === 'true';
      
      if (newFilterMode !== filterMode) setFilterMode(newFilterMode);
      if (newLanguageMode !== languageMode) setLanguageMode(newLanguageMode);
      if (newDebugMode !== debugMode) setDebugMode(newDebugMode);
    };
    
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [filterMode, languageMode, debugMode]);

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

  // Función para disparar evento custom que Catalog escuchará
  const notifyCatalogUpdate = () => {
    console.log('📢 App.js: Disparando evento localStorageChange');
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: {
        timestamp: Date.now(),
        source: 'secretConfig'
      }
    }));
  };

  // Función para abrir popup de nuevo video
  const openNewVideoPopup = () => {
    console.log('🎬 Abriendo popup para nuevo video');
    setVideoPopupMode('new');
    setVideoPopupData(null); // Sin datos para nuevo video
    setShowVideoPopup(true);
  };

  // Función para abrir popup de edición de video
  const openEditVideoPopup = (videoData) => {
    console.log('✏️ Abriendo popup para editar video:', videoData?.id);
    setVideoPopupMode('edit');
    setVideoPopupData(videoData); // Datos del video a editar
    setShowVideoPopup(true);
  };

  // Función para cerrar el popup
  const closeVideoPopup = () => {
    console.log('❌ Cerrando popup de video');
    setShowVideoPopup(false);
    setVideoPopupData(null);
  };

  // Función callback cuando se guarda un video (nuevo o editado)
  const handleVideoSaved = () => {
    console.log('✅ Video guardado exitosamente');
    // Notificar a Catalog para que refresque los videos
    notifyCatalogUpdate();
    closeVideoPopup();
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
- "l" para usuario normal
- "d" para modo Debug/Detalles (alternar)
- "n" para Nuevo video`); // Añadida opción 'n'

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
      console.log(`🎯 App.js: Cambiando filterMode a "${trimmedInput}"`);
      localStorage.setItem('filterMode', trimmedInput);
      setFilterMode(trimmedInput);
      notifyCatalogUpdate();
    }
    else if (['es', 'en', 't'].includes(trimmedInput)) {
      console.log(`🎯 App.js: Cambiando languageMode a "${trimmedInput}"`);
      localStorage.setItem('languageMode', trimmedInput);
      setLanguageMode(trimmedInput);
      notifyCatalogUpdate();
    }
    else if (trimmedInput === 'e' || trimmedInput === 'l') {
      console.log(`🎯 App.js: Cambiando userType a "${trimmedInput}"`);
      setUserType(trimmedInput);
      localStorage.setItem('userType', trimmedInput);
    }
    else if (trimmedInput === 'd') {
      const currentDebug = localStorage.getItem('debugMode') === 'true';
      const newDebugMode = !currentDebug;
      console.log(`🎯 App.js: Cambiando debugMode a "${newDebugMode}"`);
      localStorage.setItem('debugMode', newDebugMode.toString());
      setDebugMode(newDebugMode);
      notifyCatalogUpdate();
    }
    else if (trimmedInput === 'n') {
      // NUEVA OPCIÓN: Abrir popup para nuevo video
      openNewVideoPopup();
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

  const getDebugColor = () => {
    return debugMode ? 'bg-yellow-500 text-black' : '';
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
        {debugMode && (
          <span className={`${getDebugColor()} px-2 py-1 rounded text-xs font-bold animate-pulse`}>
            DEBUG
          </span>
        )}
      </div>

      <div className='absolute top-[10px] right-[30px] text-white text-sm'>
        v{version}
      </div>

      {currentView === 'catalog' ? (
        <Catalog 
          onVideoSelect={handleVideoSelect} 
          userType={userType}
          onEditVideo={openEditVideoPopup} // Nueva prop para editar
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

      {/* Popup de nuevo/editar video */}
      {showVideoPopup && (
        <NewEditPopup
          mode={videoPopupMode}
          videoData={videoPopupData}
          onSave={handleVideoSaved}
          onClose={closeVideoPopup}
        />
      )}
    </div>
  );
}

export default App;