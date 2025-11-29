import { useState, useEffect, useCallback } from 'react';
import Videos from './Videos';

const Catalog = ({ onVideoSelect, userType, filterMode, languageMode }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [groupedVideos, setGroupedVideos] = useState({});
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  // Filtrar videos SOLO por filterMode y languageMode
  const getFilteredVideos = useCallback(() => {
    let filtered = Videos;

    // 1. Filtro por filterMode (videos/música/radio)
    switch (filterMode) {
      case 'm':
        // Solo videos con music: true
        filtered = filtered.filter(video => video.music === true);
        break;
      case 'v':
      case 'r':
        // Modo videos y radio muestran todos los videos
        break;
      default:
        break;
    }

    // 2. Filtro por languageMode (español/inglés/todos)
    switch (languageMode) {
      case 'es':
        // Solo videos en español
        filtered = filtered.filter(video => video.language === 'ES');
        break;
      case 'en':
        // Solo videos en inglés
        filtered = filtered.filter(video => video.language === 'EN');
        break;
      case 't':
        // Todos los idiomas - no filtrar
        break;
      default:
        break;
    }

    console.log('Filtros aplicados:', { filterMode, languageMode, videosFiltrados: filtered.length });
    
    return filtered;
  }, [filterMode, languageMode]);

  const getRandomVideos = useCallback(() => {
    const filteredVideos = getFilteredVideos();
    const shuffled = [...filteredVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [getFilteredVideos]);

  useEffect(() => {
    const filteredVideos = getFilteredVideos();
    setRecommendedVideos(getRandomVideos());
    
    const grouped = filteredVideos.reduce((acc, video) => {
      if (!acc[video.group]) acc[video.group] = [];
      acc[video.group].push(video);
      return acc;
    }, {});
    
    setGroupedVideos(grouped);
  }, [filterMode, languageMode, getFilteredVideos, getRandomVideos]);

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
  }, [filterMode, languageMode, getFilteredVideos]);

  return (
    <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)]">
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