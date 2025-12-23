import { useState, useEffect, useCallback } from 'react';

const Catalog = ({ onVideoSelect, userType, onEditVideo }) => { // Añadido onEditVideo prop
  const [loadedImages, setLoadedImages] = useState({});
  const [groupedVideos, setGroupedVideos] = useState({});
  const [groupedVideosRandomOrder, setGroupedVideosRandomOrder] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Usar un estado para forzar re-render cuando cambien los parámetros
  const [paramsVersion, setParamsVersion] = useState(0);
  
  // Leer parámetros directamente de localStorage CADA VEZ que se renderice
  const getCurrentParams = () => {
    return {
      filterMode: localStorage.getItem('filterMode') || 'v',
      languageMode: localStorage.getItem('languageMode') || 't',
      debugMode: localStorage.getItem('debugMode') === 'true'
    };
  };

  // Función para convertir languageMode a formato API
  const getApiLanguage = useCallback((langMode) => {
    switch (langMode) {
      case 'es': return 'ES';
      case 'en': return 'EN';
      case 't': return 'all';
      default: return 'all';
    }
  }, []);

  // Función para convertir filterMode a parámetro music - CORREGIDA
  const getApiMusicParam = useCallback((filtMode) => {
    switch (filtMode) {
      case 'm': return 'true';   // Solo música
      case 'r': return 'false';  // Solo NO música (para radio)
      case 'v': return null;     // TODOS los videos (modo videos)
      default: return null;      // Por defecto: todos
    }
  }, []);

  // Función para randomizar el orden de un array (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch videos desde la API - AHORA recibe parámetros explícitos
  const fetchVideos = useCallback(async (filterMode, languageMode) => {
    try {
      setLoading(true);
      setError(null);

      const language = getApiLanguage(languageMode);
      const musicParam = getApiMusicParam(filterMode);
      
      // Construir URL de la API
      let apiUrl = `https://videokids.visssible.com/backend/get-videos.php?language=${language}`;
      
      // Solo agregar music param si es necesario
      if (musicParam !== null) {
        apiUrl += `&music=${musicParam}`;
      }

      console.log('🔍 FETCHING VIDEOS con parámetros:');
      console.log('   filterMode:', filterMode);
      console.log('   languageMode:', languageMode);
      console.log('   API Language:', language);
      console.log('   Music param:', musicParam);
      console.log('   URL:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Videos recibidos: ${data.videos.length}`);
        setAllVideos(data.videos);
        
        // NOTA: Ya NO filtramos aquí - La API ya lo hace
        const filteredVideos = data.videos;
        
        // Agrupar videos por colección
        const grouped = filteredVideos.reduce((acc, video) => {
          if (!acc[video.collection]) acc[video.collection] = [];
          acc[video.collection].push(video);
          return acc;
        }, {});
        
        setGroupedVideos(grouped);
        
        // Convertir el objeto grouped a array y randomizar el orden
        const groupedArray = Object.entries(grouped);
        const shuffledGroups = shuffleArray(groupedArray);
        setGroupedVideosRandomOrder(shuffledGroups);
        
        // Generar recomendados aleatorios
        const shuffled = [...filteredVideos].sort(() => 0.5 - Math.random());
        setRecommendedVideos(shuffled.slice(0, 6));
        
        console.log(`✅ Procesamiento completo. Colecciones: ${shuffledGroups.length}`);
      } else {
        throw new Error(data.error || 'Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getApiLanguage, getApiMusicParam]);

  // Efecto principal: cargar videos cuando cambien los parámetros
  useEffect(() => {
    const params = getCurrentParams();
    console.log('🔄 useEffect ejecutado con params:', params);
    fetchVideos(params.filterMode, params.languageMode);
  }, [paramsVersion, fetchVideos]);

  // Escuchar cambios en localStorage y forzar re-render
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'filterMode' || e.key === 'languageMode' || e.key === 'debugMode') {
        console.log('📝 Storage cambiado:', e.key, '=', e.newValue);
        // Forzar un re-render incrementando la versión
        setParamsVersion(prev => prev + 1);
      }
    };

    // Escuchar evento storage
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar nuestro propio evento custom (que App.js disparará)
    const handleCustomStorageChange = () => {
      console.log('🎯 Evento custom de storage recibido');
      setParamsVersion(prev => prev + 1);
    };
    
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    // Verificar periódicamente (por si acaso)
    const interval = setInterval(() => {
      const params = getCurrentParams();
      const savedFilterMode = localStorage.getItem('filterMode') || 'v';
      const savedLanguageMode = localStorage.getItem('languageMode') || 't';
      
      if (params.filterMode !== savedFilterMode || params.languageMode !== savedLanguageMode) {
        console.log('⏰ Check periódico: parámetros cambiaron, forzando re-render');
        setParamsVersion(prev => prev + 1);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Cargar imágenes cuando cambien los videos
  useEffect(() => {
    const params = getCurrentParams();
    
    // Cargar TODAS las imágenes - La API ya filtró lo necesario
    allVideos.forEach((video) => {
      // En modo música, cargar la imagen del álbum, de lo contrario cargar el cover normal
      const imageToLoad = params.filterMode === 'm' && video.album ? video.album : video.cover;
      const img = new Image();
      img.src = `/covers/${imageToLoad}.png`;
      img.onload = () => setLoadedImages(prev => ({ ...prev, [video.id]: true }));
      img.onerror = () => {
        console.error(`Error loading: /covers/${imageToLoad}.png`);
        setLoadedImages(prev => ({ ...prev, [video.id]: false }));
      };
    });
  }, [allVideos]);

  // Obtener parámetros actuales para usar en las funciones helper
  const currentParams = getCurrentParams();

  // Función para obtener la imagen a mostrar
  const getImageToShow = (video) => {
    // En modo música, mostrar álbum si existe, de lo contrario mostrar cover normal
    if (currentParams.filterMode === 'm' && video.album) {
      return `/covers/${video.album}.png`;
    }
    return `/covers/${video.cover}.png`;
  };

  // Función para obtener el texto alternativo
  const getImageAlt = (video) => {
    if (currentParams.filterMode === 'm' && video.album) {
      return `${video.album} (álbum)`;
    }
    return video.cover;
  };

  // Función para obtener la clase CSS según el modo
  const getImageContainerClass = () => {
    // En modo música: aspecto cuadrado (1:1), en otros modos: aspecto video (16:9)
    return currentParams.filterMode === 'm' 
      ? "relative aspect-square overflow-hidden rounded-lg"  // Cuadrado para música
      : "relative aspect-video overflow-hidden rounded-lg"; // Rectangular para videos/radio
  };

  // Función para obtener la clase del grid según el modo
  const getGridClass = () => {
    // En modo música: más columnas (álbumes cuadrados)
    // En modos video/radio: menos columnas (thumbnails rectangulares)
    return currentParams.filterMode === 'm' 
      ? "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4"  // Más columnas para música
      : "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4"; // Menos columnas para videos/radio
  };

  // Función para obtener la clase de filtro de imagen según el modo
  const getImageFilterClass = () => {
    // En modo radio: blanco y negro, en otros modos: color normal
    return currentParams.filterMode === 'r' 
      ? "grayscale"  // Blanco y negro para radio
      : "";          // Color normal para videos/música
  };

  // Función para formatear campos de debug
  const formatDebugField = (label, value) => {
    if (value === null || value === undefined || value === '') {
      return `${label}: <span class="text-gray-400">null</span>`;
    }
    return `${label}: <span class="text-yellow-300">${value}</span>`;
  };

  // Función para manejar clic en botón editar
  const handleEditClick = (video, e) => {
    e.stopPropagation(); // Evita que se active el clic en el video
    console.log(`✏️ Editando video ID: ${video.id}`);
    if (onEditVideo) {
      onEditVideo(video);
    }
  };

  // Mostrar estados de carga/error
  if (loading) {
    return (
      <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)] flex items-center justify-center">
        <div className="text-white text-xl">
          <i className="fa fa-spinner fa-spin mr-2"></i>
          Cargando videos...
          <div className="text-sm text-gray-400 mt-2">
            Filtro: {currentParams.filterMode === 'v' ? 'Videos' : currentParams.filterMode === 'm' ? 'Música' : 'Radio'} | 
            Idioma: {currentParams.languageMode === 'es' ? 'Español' : currentParams.languageMode === 'en' ? 'Inglés' : 'Todos'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)] flex items-center justify-center">
        <div className="text-red-500 text-xl">
          <i className="fa fa-exclamation-triangle mr-2"></i>
          Error: {error}
          <button 
            onClick={() => fetchVideos(currentParams.filterMode, currentParams.languageMode)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (allVideos.length === 0) {
    return (
      <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)] flex items-center justify-center">
        <div className="text-white text-xl">
          No hay videos disponibles con los filtros seleccionados.
          <div className="text-sm text-gray-400 mt-2">
            Filtro: {currentParams.filterMode} | Idioma: {currentParams.languageMode}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)]">
      {currentParams.debugMode && (
        <div className="mb-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
          <h2 className="text-yellow-400 text-lg font-bold mb-2">
            <i className="fa fa-bug mr-2"></i> Modo Debug Activo
          </h2>
          <p className="text-yellow-300 text-sm">
            Mostrando detalles técnicos. Total videos: {allVideos.length}
          </p>
          <p className="text-yellow-200 text-xs mt-2">
            Filtros actuales: {currentParams.filterMode} | Idioma: {currentParams.languageMode}
          </p>
          <button 
            onClick={() => setParamsVersion(prev => prev + 1)}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Forzar recarga
          </button>
        </div>
      )}

      {userType !== 'e' && recommendedVideos.length > 0 && (
        <div className="border-white-200 border-b py-6">
          <h2 className="text-white text-2xl font-bold mb-4">
            <i className='fa fa-star'></i> Recomendados
          </h2>
          <div className={getGridClass()}>
            {recommendedVideos.map((video, index) => (
              <div key={`recommended-${video.id || index}`} className="relative">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className={`${getImageContainerClass()} cursor-pointer`}
                >
                  <img
                    className={`w-full h-full object-cover ${getImageFilterClass()} ${loadedImages[video.id] === false ? 'hidden' : ''}`}
                    src={getImageToShow(video)}
                    alt={getImageAlt(video)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setLoadedImages(prev => ({ ...prev, [video.id]: false }));
                    }}
                  />
                  {loadedImages[video.id] === false && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                  )}
                </div>
                
                {/* Debug info para videos recomendados */}
                {currentParams.debugMode && (
                  <div className="mt-2 p-2 bg-gray-900 bg-opacity-80 rounded text-xs">
                    <div className="text-white font-bold mb-1 truncate">ID: {video.id}</div>
                    <div className="text-gray-300 space-y-1">
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('cover', video.cover) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('collection', video.collection) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('language', video.language) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('description', video.description) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('tags', video.tags) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('music', video.music ? 'true' : 'false') }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('album', video.album) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('ethan', video.ethan) }} />
                    </div>
                    {/* Botón de editar para videos recomendados */}
                    <button
                      onClick={(e) => handleEditClick(video, e)}
                      className="mt-2 w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center justify-center gap-1"
                    >
                      <i className="fa fa-edit text-xs"></i>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar colecciones en orden aleatorio */}
      {groupedVideosRandomOrder.map(([collection, collectionVideos]) => (
        <div key={collection} className="border-white-200 border-b py-6">
          <h2 className="text-white text-2xl font-bold mb-4 capitalize">
            {collection.replace(/-/g, ' ')}
          </h2>
          <div className={getGridClass()}>
            {collectionVideos.map((video, index) => (
              <div key={`${collection}-${video.id || index}`} className="relative">
                <div 
                  onClick={() => onVideoSelect(video.url, video.cover)}
                  className={`${getImageContainerClass()} cursor-pointer`}
                >
                  <img
                    className={`w-full h-full object-cover ${getImageFilterClass()} ${loadedImages[video.id] === false ? 'hidden' : ''}`}
                    src={getImageToShow(video)}
                    alt={getImageAlt(video)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setLoadedImages(prev => ({ ...prev, [video.id]: false }));
                    }}
                  />
                  {loadedImages[video.id] === false && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                  )}
                </div>
                
                {/* Debug info para videos normales */}
                {currentParams.debugMode && (
                  <div className="mt-2 p-2 bg-gray-900 bg-opacity-80 rounded text-xs">
                    <div className="text-white font-bold mb-1 truncate">ID: {video.id}</div>
                    <div className="text-gray-300 space-y-1">
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('cover', video.cover) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('collection', video.collection) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('language', video.language) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('description', video.description) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('tags', video.tags) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('music', video.music ? 'true' : 'false') }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('album', video.album) }} />
                      <div dangerouslySetInnerHTML={{ __html: formatDebugField('ethan', video.ethan) }} />
                    </div>
                    {/* Botón de editar para videos normales */}
                    <button
                      onClick={(e) => handleEditClick(video, e)}
                      className="mt-2 w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center justify-center gap-1"
                    >
                      <i className="fa fa-edit text-xs"></i>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Catalog;