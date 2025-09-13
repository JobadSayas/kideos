import { useState, useEffect } from 'react';
import Videos from './Videos';

const Catalog = ({ onVideoSelect, userType }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [groupedVideos, setGroupedVideos] = useState({});
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  // Filtrar videos según el tipo de usuario
  const getFilteredVideos = () => {
    if (userType === 'e') {
      // Para usuario 'e', solo mostrar videos con ethan: true
      return Videos.filter(video => video.ethan === true);
    } else {
      // Para otros usuarios, mostrar todos los videos
      return Videos;
    }
  };

  const getRandomVideos = () => {
    const filteredVideos = getFilteredVideos();
    const shuffled = [...filteredVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    const filteredVideos = getFilteredVideos();
    setRecommendedVideos(getRandomVideos());
    
    const grouped = filteredVideos.reduce((acc, video) => {
      if (!acc[video.group]) acc[video.group] = [];
      acc[video.group].push(video);
      return acc;
    }, {});
    
    setGroupedVideos(grouped);
  }, [userType]); // Añadí userType como dependencia

  useEffect(() => {
    const filteredVideos = getFilteredVideos();
    filteredVideos.forEach((video, index) => {
      const img = new Image();
      img.src = `/covers/${video.cover}.png`;
      img.onload = () => setLoadedImages(prev => ({ ...prev, [index]: true }));
      img.onerror = () => {
        console.error(`Error loading: /covers/${video.cover}.png`);
        setLoadedImages(prev => ({ ...prev, [index]: false }));
      };
    });
  }, [userType]); // Añadí userType como dependencia

  return (
    <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)]">
      {/* Mostrar sección Recomendados solo si userType no es 'e' */}
      {userType !== 'e' && (
        <div className="border-white-200 border-b py-6">
          <h2 className="text-white text-2xl font-bold mb-4"><i className='fa fa-star'></i> Recomendados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {recommendedVideos.map((video, index) => (
              <div key={`recommended-${index}`} className="relative cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    className={`w-full h-full object-cover ${loadedImages[Videos.indexOf(video)] === false ? 'hidden' : ''}`}
                    src={`/covers/${video.cover}.png`}
                    alt={video.cover}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setLoadedImages(prev => ({ ...prev, [Videos.indexOf(video)]: false }));
                    }}
                  />
                  
                  {loadedImages[Videos.indexOf(video)] === false && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.entries(groupedVideos).map(([groupName, groupVideos]) => (
        <div key={groupName} className="border-white-200 border-b py-6">
          <h2 className="text-white text-2xl font-bold mb-4 capitalize">
            {groupName.replace('-', ' ')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {groupVideos.map((video, index) => (
              <div key={`${groupName}-${index}`} className="relative cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    className={`w-full h-full object-cover ${loadedImages[Videos.indexOf(video)] === false ? 'hidden' : ''}`}
                    src={`/covers/${video.cover}.png`}
                    alt={video.cover}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setLoadedImages(prev => ({ ...prev, [Videos.indexOf(video)]: false }));
                    }}
                  />
                  
                  {loadedImages[Videos.indexOf(video)] === false && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                  )}
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