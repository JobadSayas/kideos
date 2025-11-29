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
      // En modo música, cargar la imagen del álbum, de lo contrario cargar el cover normal
      const imageToLoad = filterMode === 'm' && video.album ? video.album : video.cover;
      const img = new Image();
      img.src = `/covers/${imageToLoad}.png`;
      img.onload = () => setLoadedImages(prev => ({ ...prev, [index]: true }));
      img.onerror = () => {
        console.error(`Error loading: /covers/${imageToLoad}.png`);
        setLoadedImages(prev => ({ ...prev, [index]: false }));
      };
    });
  }, [filterMode, languageMode, getFilteredVideos]);

  // Función para obtener la imagen a mostrar
  const getImageToShow = (video) => {
    // En modo música, mostrar álbum si existe, de lo contrario mostrar cover normal
    if (filterMode === 'm' && video.album) {
      return `/covers/${video.album}.png`;
    }
    return `/covers/${video.cover}.png`;
  };

  // Función para obtener el texto alternativo
  const getImageAlt = (video) => {
    if (filterMode === 'm' && video.album) {
      return `${video.album} (álbum)`;
    }
    return video.cover;
  };

  // Función para obtener la clase CSS según el modo
  const getImageContainerClass = () => {
    // En modo música: aspecto cuadrado (1:1), en otros modos: aspecto video (16:9)
    return filterMode === 'm' 
      ? "relative aspect-square overflow-hidden rounded-lg"  // Cuadrado para música
      : "relative aspect-video overflow-hidden rounded-lg"; // Rectangular para videos/radio
  };

  // Función para obtener la clase del grid según el modo
  const getGridClass = () => {
    // En modo música: más columnas (álbumes cuadrados)
    // En modos video/radio: menos columnas (thumbnails rectangulares)
    return filterMode === 'm' 
      ? "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4"  // Más columnas para música
      : "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4"; // Menos columnas para videos/radio
  };

  // Función para obtener la clase de filtro de imagen según el modo
  const getImageFilterClass = () => {
    // En modo radio: blanco y negro, en otros modos: color normal
    return filterMode === 'r' 
      ? "grayscale"  // Blanco y negro para radio
      : "";          // Color normal para videos/música
  };

  return (
    <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)]">
      {userType !== 'e' && (
        <div className="border-white-200 border-b py-6">
          <h2 className="text-white text-2xl font-bold mb-4"><i className='fa fa-star'></i> Recomendados</h2>
          <div className={getGridClass()}>
            {recommendedVideos.map((video, index) => (
              <div key={`recommended-${index}`} className="relative cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className={getImageContainerClass()}
                >
                  <img
                    className={`w-full h-full object-cover ${getImageFilterClass()} ${loadedImages[Videos.indexOf(video)] === false ? 'hidden' : ''}`}
                    src={getImageToShow(video)}
                    alt={getImageAlt(video)}
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
          <div className={getGridClass()}>
            {groupVideos.map((video, index) => (
              <div key={`${groupName}-${index}`} className="relative cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className={getImageContainerClass()}
                >
                  <img
                    className={`w-full h-full object-cover ${getImageFilterClass()} ${loadedImages[Videos.indexOf(video)] === false ? 'hidden' : ''}`}
                    src={getImageToShow(video)}
                    alt={getImageAlt(video)}
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