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
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'fs': 0,
            'cc_load_policy': 0,  // Primera capa de protección
            'iv_load_policy': 3,
            'rel': 0
          },
          events: {
            'onReady': (event) => {
              // Segunda capa de protección (fuerza desactivación)
              event.target.setOption('captions', 'off');
              event.target.setOption('subtitles', 'off');
              // Tercera capa (por si acaso)
              event.target.unloadModule('captions');
            },
            'onStateChange': (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              // Cuarta capa cuando cambia el estado
              if (event.target.getOptions().includes('captions')) {
                event.target.setOption('captions', 'off');
              }
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
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
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
        className="pointer-events-none w-[1000px] h-[564px]"
      ></div>
      <button
        onClick={togglePlay}
        className="px-6 py-2 text-white rounded-full transition-all mt-4 w-[50px] h-[55px] flex justify-center items-center border-[3px] border-white absolute bottom-[10px] left-[10px]"
      >
        <i className={`text-2xl fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
      </button>
    </div>
  );
};

export default Video;