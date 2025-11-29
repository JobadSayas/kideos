import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const VideoPlayer = ({ url, videoCover, onBack, timeLeft, setIsTimerRunning, filterMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const [apiCalled, setApiCalled] = useState(false);

  // Calcular opacidad del layer durante el último minuto (60 segundos)
  const getLayerOpacity = () => {
    if (timeLeft > 60) return 0; // Más de 1 minuto: completamente transparente
    if (timeLeft <= 0) return 1; // Tiempo agotado: completamente opaco
    
    // Durante el último minuto: calcular opacidad gradual (0 a 1)
    // Cuando timeLeft = 60 -> opacity = 0
    // Cuando timeLeft = 0 -> opacity = 1
    return 1 - (timeLeft / 60);
  };

  // Calcular volumen durante el último minuto (100% a 0%)
  const getVolume = () => {
    if (timeLeft > 60) return 100; // Más de 1 minuto: volumen máximo
    if (timeLeft <= 0) return 0;   // Tiempo agotado: volumen cero
    
    // Durante el último minuto: calcular volumen gradual (100 a 0)
    // Cuando timeLeft = 60 -> volume = 100
    // Cuando timeLeft = 0 -> volume = 0
    return Math.max(0, Math.min(100, (timeLeft / 60) * 100));
  };

  const layerOpacity = getLayerOpacity();
  const volume = getVolume();
  const showLayer = layerOpacity > 0; // Mostrar layer si tiene alguna opacidad

  const registerVideoPlay = async () => {
    if (!videoCover) {
      console.error('No se recibió videoCover');
      return;
    }

    if (apiCalled) return;
    
    console.log('Registrando cover en API:', videoCover);
    
    try {
      const response = await axios.post(
        'https://videokids.visssible.com/backend/insert-history.php',
        { videoName: videoCover },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta API:', response.data);
      setApiCalled(true);

    } catch (error) {
      console.error('Error al registrar:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  useEffect(() => {
    setApiCalled(false);
  }, [url]);

  // Efecto para controlar el volumen del video
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      console.log(`Ajustando volumen a: ${volume}%`);
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (timeLeft <= 0 && isPlaying && playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      setIsTimerRunning(false);
    }
  }, [timeLeft, isPlaying, setIsTimerRunning]);

  useEffect(() => {
    const handleStateChange = (event) => {
      const newIsPlaying = event.data === window.YT.PlayerState.PLAYING;
      setIsPlaying(newIsPlaying);
      setIsTimerRunning(newIsPlaying);

      if (newIsPlaying) {
        registerVideoPlay();
      }
    };

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      const videoId = url.split('/embed/')[1]?.split('?')[0] || '';
      
      playerRef.current = new window.YT.Player('player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          rel: 0,
          hl: 'en'
        },
        events: {
          onReady: (event) => {
            // Establecer volumen inicial
            event.target.setVolume(volume);
            
            event.target.setOption('captions', 'off');
            event.target.setOption('subtitles', 'off');
            event.target.unloadModule('captions');
            setTimeout(() => {
              const ccButton = document.querySelector('.ytp-subtitles-button');
              if (ccButton) ccButton.remove();
            }, 1000);
          },
          onStateChange: handleStateChange
        }
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onload = () => {
        window.onYouTubeIframeAPIReady = initPlayer;
      };
      document.body.appendChild(tag);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else if (timeLeft > 0) {
      playerRef.current.playVideo();
    }
  };

  // Determinar si el video debe estar oculto (modo radio o música)
  const isVideoHidden = filterMode === 'r' || filterMode === 'm';

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Layer gradual durante el último minuto */}
      {showLayer && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center transition-opacity duration-1000"
          style={{ opacity: layerOpacity }}
        >
          <i className="fa-solid fa-clock text-white text-8xl mb-4"></i>
        </div>
      )}
      
      <div className="flex-grow flex items-center justify-center bg-black relative">
        {/* Overlay para modo radio o música */}
        {isVideoHidden && (
          <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
            <div className="text-white text-center">
              {filterMode === 'r' ? (
                // Modo Radio
                <>
                  <i className="fa-solid fa-radio text-6xl mb-4 text-purple-500"></i>
                  <p className="text-xl">Modo Radio</p>
                  <p className="text-sm text-gray-400 mt-2">Reproduciendo audio</p>
                </>
              ) : (
                // Modo Música
                <>
                  <img 
                    src={`/covers/${videoCover}a.png`} 
                    alt="Álbum" 
                    className="w-[300px] h-[300px] rounded-lg mx-auto mb-4 object-cover"
                    onError={(e) => {
                      e.target.src = `/covers/${videoCover}.png`;
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
        
        <div 
          id="player" 
          className={`w-full h-full max-w-[1100px] max-h-[620px] bg-black ${
            isVideoHidden ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
      
      <div className="w-full py-4 px-6 bg-gradient-to-t from-black to-transparent flex justify-between items-center">
        <button
          onClick={togglePlay}
          className="px-6 py-2 text-white rounded-full w-[40px] h-[55px] flex justify-center items-center border-[3px] border-white bg-black bg-opacity-50 hover:bg-opacity-75"
          disabled={timeLeft <= 0}
        >
          <i className={`text-xl fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`} />
        </button>
        
        <button
          onClick={onBack}
          className="px-4 py-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 flex items-center gap-2"
        >
          <i className="fa-solid fa-table text-4xl" />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;