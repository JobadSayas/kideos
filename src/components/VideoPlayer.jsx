import { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ url, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        
        playerRef.current = new window.YT.Player('player', {
          videoId: url.split('/embed/')[1].split('?')[0],
          playerVars: {
            'autoplay': 1, // Ahora autoplay está activado
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'rel': 0,
            'hl': 'en'
          },
          events: {
            'onReady': (event) => {
              event.target.setOption('captions', 'off');
              event.target.setOption('subtitles', 'off');
              event.target.unloadModule('captions');
              setTimeout(() => {
                const ccButton = document.querySelector('.ytp-subtitles-button');
                if (ccButton) ccButton.remove();
              }, 1000);
              setIsPlaying(true); // Comienza a reproducir automáticamente
            },
            'onStateChange': (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              event.target.setOption('captions', 'off');
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (playerRef.current) {
      isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
  {/* Contenedor del reproductor */}
  <div className="flex-grow flex items-center justify-center bg-black">
    <div 
      id="player" 
      className="pointer-events-none w-full h-full max-w-[1100px] max-h-[620px] bg-black"
    ></div>
  </div>
  
  {/* Barra de controles inferior */}
  <div className="w-full py-4 px-6 bg-gradient-to-t from-black to-transparent flex justify-between items-center">
    {/* Botón de play/pause */}
    <button
      onClick={togglePlay}
      className="px-6 py-2 text-white rounded-full w-[40px] h-[55px] flex justify-center items-center border-[3px] border-white bg-black bg-opacity-50 hover:bg-opacity-75"
    >
      <i className={`text-xl fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
    </button>
    
    {/* Botón para volver al catálogo */}
    <button
      onClick={onBack}
      className="px-4 py-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 flex items-center gap-2"
    >
      <i className="fa-solid fa-table text-4xl"></i>
    </button>
  </div>
</div>
  );
};

export default VideoPlayer;