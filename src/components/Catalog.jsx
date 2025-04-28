import { useState, useEffect } from 'react';
import Videos from './Videos';

const Catalog = ({ onVideoSelect }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [groupedVideos, setGroupedVideos] = useState({});

  useEffect(() => {
    const grouped = Videos.reduce((acc, video) => {
      if (!acc[video.group]) acc[video.group] = [];
      acc[video.group].push(video);
      return acc;
    }, {});
    setGroupedVideos(grouped);
  }, []);

  useEffect(() => {
    Videos.forEach((video, index) => {
      const img = new Image();
      img.src = `/covers/${video.cover}.png`;
      img.onload = () => setLoadedImages(prev => ({ ...prev, [index]: true }));
      img.onerror = () => {
        console.error(`Error loading: /covers/${video.cover}.png`);
        setLoadedImages(prev => ({ ...prev, [index]: false }));
      };
    });
  }, []);

  return (
    <div className="w-full p-6 overflow-y-auto h-[calc(100vh-40px)]">
      {Object.entries(groupedVideos).map(([groupName, groupVideos]) => (
        <div key={groupName} className="border-white-200 border-b py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupVideos.map((video, index) => (
              <div key={`${groupName}-${index}`} className="relative cursor-pointer">
                <div 
                  onClick={() => onVideoSelect(video.url)}
                  className="relative aspect-video overflow-hidden rounded-lg pointer-default"
                >
                  <img
                    className={`w-full h-full object-cover ${loadedImages[index] === false ? 'hidden' : ''}`}
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