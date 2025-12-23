import { useState, useEffect, useRef } from 'react';

const NewEditPopup = ({ mode, videoData, onSave, onClose }) => {
  // Función para extraer la URL del src del iframe
  const extractSrcFromIframe = (iframeCode) => {
    if (!iframeCode) return '';
    
    const srcMatch = iframeCode.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
    
    return iframeCode.trim();
  };

  // Función para generar cover dinámico
  const generateCoverName = (collection) => {
    if (!collection.trim()) return '';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const cleanCollection = collection.toLowerCase().replace(/\s+/g, '-');
    return `${cleanCollection}-${randomNum}`;
  };

  // Función para generar album dinámico
  const generateAlbumName = (coverName) => {
    if (!coverName.trim()) return '';
    return `${coverName}-a`;
  };

  // Estado inicial basado en modo y datos
  const getInitialFormData = () => {
    if (mode === 'edit' && videoData) {
      return {
        id: videoData.id,
        url: videoData.url || '',
        cover: videoData.cover || '',
        collection: videoData.collection || '',
        language: videoData.language || 'ES',
        description: videoData.description || '',
        tags: videoData.tags || '',
        music: videoData.music || false,
        album: videoData.album || ''
      };
    }
    
    return {
      id: null,
      url: '',
      cover: '',
      collection: '',
      language: 'ES',
      description: '',
      tags: '',
      music: false,
      album: ''
    };
  };

  // Estados principales
  const [formData, setFormData] = useState(getInitialFormData());
  const [iframeInput, setIframeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAlbum, setCopiedAlbum] = useState(false);
  
  // Estados para el componente de colecciones
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionInputFocused, setCollectionInputFocused] = useState(false);
  
  // Referencias
  const collectionInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Resetear formulario cuando cambian los props
  useEffect(() => {
    const initialData = getInitialFormData();
    setFormData(initialData);
    
    if (mode === 'edit' && initialData.url) {
      setIframeInput(initialData.url);
    } else {
      setIframeInput('');
    }
    
    setError(null);
    setSuccess(false);
    setCopied(false);
    setCopiedAlbum(false);
    setShowCollectionsDropdown(false);
  }, [mode, videoData]);

  // Cargar colecciones al montar el componente
  useEffect(() => {
    fetchCollections();
  }, []);

  // Filtrar colecciones cuando cambia el input
  useEffect(() => {
    if (formData.collection.trim() === '') {
      setFilteredCollections(collections);
    } else {
      const searchTerm = formData.collection.toLowerCase();
      const filtered = collections.filter(collection => 
        collection.toLowerCase().includes(searchTerm)
      );
      setFilteredCollections(filtered);
    }
  }, [formData.collection, collections]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          collectionInputRef.current && !collectionInputRef.current.contains(event.target)) {
        setShowCollectionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generar cover y album cuando cambia la colección (solo en modo new)
  useEffect(() => {
    if (mode === 'new' && formData.collection.trim()) {
      const newCover = generateCoverName(formData.collection);
      const newAlbum = generateAlbumName(newCover);
      
      setFormData(prev => ({
        ...prev,
        cover: newCover,
        album: formData.music ? newAlbum : ''
      }));
    }
  }, [formData.collection, mode]);

  // Generar album cuando cambia el cover (solo en modo new con music activado)
  useEffect(() => {
    if (mode === 'new' && formData.music && formData.cover.trim()) {
      const newAlbum = generateAlbumName(formData.cover);
      setFormData(prev => ({
        ...prev,
        album: newAlbum
      }));
    }
  }, [formData.cover, formData.music, mode]);

  // Función para obtener colecciones desde API o cache
  const fetchCollections = async () => {
    const CACHE_KEY = 'videokids_collections';
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos
    
    // Verificar cache primero
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Usar cache si no ha expirado
      if (now - timestamp < CACHE_DURATION) {
        setCollections(data);
        setFilteredCollections(data);
        return;
      }
    }
    
    // Si no hay cache o expiró, hacer fetch
    setLoadingCollections(true);
    try {
      const response = await fetch('https://videokids.visssible.com/backend/get-collections.php');
      const result = await response.json();
      
      if (result.success) {
        setCollections(result.collections);
        setFilteredCollections(result.collections);
        
        // Guardar en cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: result.collections,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('Error cargando colecciones:', err);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Manejar cambios en el input del iframe
  const handleIframeChange = (e) => {
    const value = e.target.value;
    setIframeInput(value);
    
    const extractedUrl = extractSrcFromIframe(value);
    setFormData(prev => ({
      ...prev,
      url: extractedUrl
    }));
  };

  // Manejar cambios en la colección
  const handleCollectionChange = (e) => {
    const value = e.target.value;
    
    const newFormData = {
      ...formData,
      collection: value
    };
    
    // Si está en modo new, generar cover
    if (mode === 'new' && value.trim()) {
      const newCover = generateCoverName(value);
      newFormData.cover = newCover;
      
      // Si music está activado, también generar album
      if (newFormData.music) {
        newFormData.album = generateAlbumName(newCover);
      }
    }
    
    setFormData(newFormData);
    
    // Mostrar dropdown al escribir
    if (value.trim() && !showCollectionsDropdown) {
      setShowCollectionsDropdown(true);
    }
  };

  // Manejar focus en el input de colección
  const handleCollectionFocus = () => {
    setCollectionInputFocused(true);
    setShowCollectionsDropdown(true);
  };

  // Manejar blur en el input de colección
  const handleCollectionBlur = () => {
    setCollectionInputFocused(false);
    // Pequeño delay para permitir click en dropdown
    setTimeout(() => {
      if (!collectionInputFocused) {
        setShowCollectionsDropdown(false);
      }
    }, 200);
  };

  // Seleccionar una colección del dropdown
  const selectCollection = (collection) => {
    const newFormData = {
      ...formData,
      collection: collection
    };
    
    // Si está en modo new, generar cover
    if (mode === 'new' && collection.trim()) {
      const newCover = generateCoverName(collection);
      newFormData.cover = newCover;
      
      // Si music está activado, también generar album
      if (newFormData.music) {
        newFormData.album = generateAlbumName(newCover);
      }
    }
    
    setFormData(newFormData);
    setShowCollectionsDropdown(false);
    
    // Enfocar el input para continuar
    if (collectionInputRef.current) {
      collectionInputRef.current.focus();
    }
  };

  // Manejar cambios en los otros campos
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Si es checkbox de music y se activa en modo new
    if (name === 'music' && checked && mode === 'new' && formData.cover.trim()) {
      newFormData.album = generateAlbumName(formData.cover);
    }
    
    // Si es checkbox de music y se desactiva, limpiar album
    if (name === 'music' && !checked) {
      newFormData.album = '';
    }
    
    setFormData(newFormData);
  };

  // Validación básica del formulario
  const validateForm = () => {
    if (!formData.url.trim()) {
      setError('La URL es requerida');
      return false;
    }
    if (!formData.cover.trim()) {
      setError('El cover es requerido');
      return false;
    }
    if (!formData.collection.trim()) {
      setError('La colección es requerida');
      return false;
    }
    return true;
  };

  // Copiar cover al portapapeles
  const handleCopyCover = async () => {
    if (!formData.cover.trim()) return;
    
    try {
      await navigator.clipboard.writeText(formData.cover);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  // Copiar album al portapapeles
  const handleCopyAlbum = async () => {
    if (!formData.album.trim()) return;
    
    try {
      await navigator.clipboard.writeText(formData.album);
      setCopiedAlbum(true);
      setTimeout(() => setCopiedAlbum(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  // Forzar refresco de colecciones
  const refreshCollections = () => {
    localStorage.removeItem('videokids_collections');
    fetchCollections();
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiUrl = mode === 'new' 
        ? 'https://videokids.visssible.com/backend/new-video.php'
        : 'https://videokids.visssible.com/backend/edit-video.php';

      const dataToSend = {
        ...formData,
        music: formData.music ? 1 : 0
      };

      console.log(`📤 Enviando datos a ${apiUrl}:`, dataToSend);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Video guardado exitosamente:', result);
        setSuccess(true);
        
        // Actualizar cache de colecciones si es nueva colección
        const CACHE_KEY = 'videokids_collections';
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached && mode === 'new') {
          const { data, timestamp } = JSON.parse(cached);
          if (!data.includes(formData.collection)) {
            const updatedCollections = [...data, formData.collection].sort();
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: updatedCollections,
              timestamp: timestamp
            }));
          }
        }
        
        setTimeout(() => {
          if (onSave) onSave();
        }, 1500);
      } else {
        setError(result.error || 'Error al guardar el video');
        console.error('❌ Error en respuesta:', result);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
      console.error('❌ Error en fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del popup
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Manejar clic fuera del popup
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header del popup */}
        <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'new' ? 'Nuevo Video' : `Editar Video ID: ${formData.id}`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-300">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded text-green-300">
              <i className="fa fa-check-circle mr-2"></i>
              ¡Video guardado exitosamente! Cerrando...
            </div>
          )}

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 gap-4">
            {/* Línea 1: URL del Video */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                URL del Video <span className="text-red-500">*</span>
              </label>
              <textarea
                value={iframeInput}
                onChange={handleIframeChange}
                placeholder="Pega aquí el código embed de YouTube: <iframe src='...'></iframe>"
                rows="3"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
              />
              {formData.url && (
                <div className="mt-2 p-2 bg-gray-800 border border-gray-700 rounded">
                  <p className="text-gray-400 text-xs mb-1">URL extraída:</p>
                  <p className="text-green-300 text-sm font-mono break-all">{formData.url}</p>
                </div>
              )}
            </div>

            {/* Línea 2: Música checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="music"
                name="music"
                checked={formData.music}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="music" className="ml-2 text-gray-300">
                Música
              </label>
            </div>

            {/* Línea 3: Colección, Cover, Album */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Colección con dropdown personalizado */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Colección <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={refreshCollections}
                    className="ml-2 text-xs text-gray-400 hover:text-blue-400"
                    title="Refrescar lista de colecciones"
                  >
                    <i className="fa fa-refresh"></i>
                  </button>
                </label>
                
                <div className="relative">
                  <input
                    ref={collectionInputRef}
                    type="text"
                    name="collection"
                    value={formData.collection}
                    onChange={handleCollectionChange}
                    onFocus={handleCollectionFocus}
                    onBlur={handleCollectionBlur}
                    placeholder="Escribe o selecciona colección"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 pr-10"
                    required
                  />
                  
                  {/* Icono dropdown */}
                  <button
                    type="button"
                    onClick={() => setShowCollectionsDropdown(!showCollectionsDropdown)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <i className={`fa fa-chevron-${showCollectionsDropdown ? 'up' : 'down'}`}></i>
                  </button>
                </div>
                
                {/* Dropdown de colecciones */}
                {showCollectionsDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {loadingCollections ? (
                      <div className="p-3 text-center text-gray-400">
                        <i className="fa fa-spinner fa-spin mr-2"></i>
                        Cargando colecciones...
                      </div>
                    ) : filteredCollections.length === 0 ? (
                      <div className="p-3 text-gray-400 text-center">
                        No hay colecciones disponibles
                      </div>
                    ) : (
                      <>
                        {filteredCollections.map((collection, index) => (
                          <div
                            key={`${collection}-${index}`}
                            onClick={() => selectCollection(collection)}
                            className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                          >
                            {collection}
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Opción para crear nueva colección si no existe */}
                    {formData.collection.trim() && 
                     !collections.includes(formData.collection) && 
                     !filteredCollections.includes(formData.collection) && (
                      <div
                        onClick={() => selectCollection(formData.collection)}
                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-green-400 border-t border-gray-700"
                      >
                        <i className="fa fa-plus mr-2"></i>
                        Crear nueva: "{formData.collection}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Cover <span className="text-red-500">*</span>
                </label>
                {mode === 'new' ? (
                  <div>
                    <button
                      type="button"
                      onClick={handleCopyCover}
                      disabled={!formData.cover.trim()}
                      className={`w-full px-3 py-2 border rounded flex items-center justify-center gap-2 transition-colors ${
                        formData.cover.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white cursor-pointer' 
                          : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {copied ? (
                        <>
                          <i className="fa fa-check text-green-400"></i>
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <i className="fa fa-copy"></i>
                          {formData.cover || 'Ingresa colección'}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.cover}
                    disabled
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
                  />
                )}
              </div>

              {/* Album (solo si música es true) */}
              {formData.music && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Álbum
                  </label>
                  {mode === 'new' ? (
                    <div>
                      <button
                        type="button"
                        onClick={handleCopyAlbum}
                        disabled={!formData.album.trim()}
                        className={`w-full px-3 py-2 border rounded flex items-center justify-center gap-2 transition-colors ${
                          formData.album.trim() 
                            ? 'bg-purple-600 hover:bg-purple-700 border-purple-700 text-white cursor-pointer' 
                            : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {copiedAlbum ? (
                          <>
                            <i className="fa fa-check text-green-400"></i>
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <i className="fa fa-copy"></i>
                            {formData.album || 'Generando...'}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="album"
                      value={formData.album}
                      onChange={handleInputChange}
                      placeholder="nombre-album"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Línea 4: Idioma y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Idioma */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Idioma
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ES">Español (ES)</option>
                  <option value="EN">Inglés (EN)</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción breve"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Línea 5: Tags */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i>
                  {mode === 'new' ? 'Agregar Video' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEditPopup;