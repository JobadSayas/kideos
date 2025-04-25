import { useState } from 'react';

const Catalog = ({ onVideoSelect }) => {
  const [loadedImages, setLoadedImages] = useState({});

  const videos = [
    {
      id: 1,
      url: 'https://www.youtube.com/embed/sihr2zLnLcQ?si=AW12rDAPHF_Pb418&amp;controls=0',
      cover: 'pequenos-heros-1',
      group: 'pequenos-heroes'
    },
    {
      id: 2,
      url: 'https://www.youtube.com/embed/8NEzTwa7heY?si=3N1ZOvYrTufrMl7Q&amp;controls=0',
      cover: 'paw-patrol-1',
      group: 'paw-patrol'
    },
    {
      id: 3,
      url: 'https://www.youtube.com/embed/pzplSEmVsZ0?si=Y6JDCGRK6XRFIZaq&amp;controls=0',
      cover: 'blaze-1',
      group: 'blaze'
    },
    {
      id: 4,
      url: 'https://www.youtube.com/embed/Fa0tpxOmITI?si=LXKzgzSzbuuNZY9y&amp;controls=0',
      cover: 'blaze-2',
      group: 'blaze'
    },
    {
      id: 5,
      url: 'https://www.youtube.com/embed/a7pMwVVD1pk?si=6LlPVsMgsZs9UNvi&amp;controls=0',
      cover: 'superfriends-1',
      group: 'superfriends'
    },
    {
        id: 6,
        url: 'https://www.youtube.com/embed/xCoztFfStBE?si=fLC1l5r1xHSzAVa2&amp;controls=0',
        cover: 'superfriends-movie',
        group: 'superfriends'
    }

    
  ];

  // Precarga todas las imágenes al montar el componente
  const preloadImages = () => {
    videos.forEach(video => {
      const img = new Image();
      img.src = `/covers/${video.cover}.png`;
      img.onload = () => {
        setLoadedImages(prev => ({ ...prev, [video.id]: true }));
      };
      img.onerror = () => {
        console.error(`❌ Error cargando: /covers/${video.cover}.png`);
        setLoadedImages(prev => ({ ...prev, [video.id]: false }));
      };
    });
  };

  // Ejecuta la precarga al inicio
  useState(() => {
    preloadImages();
  }, []);

  return (
    <div className="grid grid-cols-6 gap-2">
      {videos.map((video) => (
        <div key={video.id} className="relative">
          {/* Imagen principal */}
          <img
            onClick={() => onVideoSelect(video.url)}
            className={`rounded transition w-full h-auto object-cover cursor-pointer hover:opacity-90 ${
              loadedImages[video.id] === false ? 'hidden' : ''
            }`}
            src={`/covers/${video.cover}.png`}
            alt={`Portada ${video.id}`}
            onError={(e) => {
              e.target.style.display = 'none';
              setLoadedImages(prev => ({ ...prev, [video.id]: false }));
            }}
          />
          
          {/* Fallback para imágenes que no cargan */}
          {loadedImages[video.id] === false && (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
              <span className="text-gray-500 text-sm">Imagen no disponible</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Catalog;