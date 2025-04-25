import { useEffect, useRef, useState } from 'react';

const Video = ({ url }) => {
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
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'fs': 0,
            'cc_load_policy': 0,  // Bloquea CC inicialmente
            'iv_load_policy': 3,
            'rel': 0,
            'hl': 'en'  // Fuerza idioma inglés (sin CC automáticos)
          },
          events: {
            'onReady': (event) => {
              // Método INFALIBLE para eliminar CC
              event.target.setOption('captions', 'off');
              event.target.setOption('subtitles', 'off');
              event.target.unloadModule('captions');
              // Elimina el botón de CC del DOM (solución nuclear)
              setTimeout(() => {
                const ccButton = document.querySelector('.ytp-subtitles-button');
                if (ccButton) ccButton.remove();
              }, 1000);
              setIsPlaying(false);
            },
            'onStateChange': (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              // Verificación constante
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
    <div className="relative flex flex-col items-center">
      <div 
        id="player" 
        className="pointer-events-none w-[1100px] h-[620px] bg-black"
      ></div>
      <button
        onClick={togglePlay}
        className="px-6 py-2 text-white rounded-full transition-all w-[50px] h-[55px] flex justify-center items-center border-[3px] border-white absolute bottom-[10px] left-[10px] z-50 bg-black bg-opacity-25"
      >
        <i className={`text-2xl fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
      </button>
    </div>
  );
};

export default Video;