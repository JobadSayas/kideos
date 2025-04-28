import { useState, useEffect } from 'react';
import Videos from './Videos';

const Catalog = ({ onVideoSelect }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [groupedVideos, setGroupedVideos] = useState({});

  // Agrupar videos por categoría al montar el componente
  useEffect(() => {
    const grouped = Videos.reduce((acc, video) => {
      if (!acc[video.group]) {
        acc[video.group] = [];
      }
      acc[video.group].push(video);
      return acc;
    }, {});

    setGroupedVideos(grouped);
  }, []);

  // Precarga todas las imágenes al montar el componente
  useEffect(() => {
    Videos.forEach((video, index) => {
      const img = new Image();
      img.src = `/covers/${video.cover}.png`;
      img.onload = () => {
        setLoadedImages(prev => ({ ...prev, [index]: true }));
      };
      img.onerror = () => {
        console.error(`❌ Error cargando: /covers/${video.cover}.png`);
        setLoadedImages(prev => ({ ...prev, [index]: false }));
      };
    });
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto p-6">
      {Object.entries(groupedVideos).map(([groupName, groupVideos]) => (
        <div key={groupName} className="border-white-200 border-b py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupVideos.map((video, index) => (
              <div key={`${groupName}-${index}`} className="relative group cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url)}
                  className="relative aspect-video overflow-hidden rounded-lg transition-transform group-hover:scale-105"
                >
                  <img
                    className={`w-full h-full object-cover ${
                      loadedImages[index] === false ? 'hidden' : ''
                    }`}
                    src={`/covers/${video.cover}.png`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setLoadedImages(prev => ({ ...prev, [index]: false }));
                    }}
                  />
                  
                  {loadedImages[index] === false && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-play text-black text-xl ml-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Catalog;