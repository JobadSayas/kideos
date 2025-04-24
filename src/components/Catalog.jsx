const Catalog = ({ onVideoSelect }) => {
    const videos = [
      {
        id: 1,
        url: 'https://www.youtube.com/embed/kLyGRfd_6Zs?enablejsapi=1&controls=0',
        cover:'pequenos-heros-2'
      },
      {
        id: 2,
        url: 'https://www.youtube.com/embed/k5gS1sCzQuk?si=_O_CUmGHGNAZoTsR&amp;controls=0',
        cover:'paw-patrol-1'
      },
      {
        id: 3,
        url: 'https://www.youtube.com/embed/6ZcMksYGiWY?enablejsapi=1&controls=0',
        cover:'pequenos-heros-2'
      },
      {
        id: 1,
        url: 'https://www.youtube.com/embed/kLyGRfd_6Zs?enablejsapi=1&controls=0',
        cover:'pequenos-heros-2'
      },
      {
        id: 2,
        url: 'https://www.youtube.com/embed/k5gS1sCzQuk?si=_O_CUmGHGNAZoTsR&amp;controls=0',
        cover:'paw-patrol-1'
      },
      {
        id: 3,
        url: 'https://www.youtube.com/embed/6ZcMksYGiWY?enablejsapi=1&controls=0',
        cover:'pequenos-heros-2'
      }
    ];
  
    return (
        <div className="grid grid-cols-6 gap-2"> {/* 3 columnas con gap de 2 */}
            {videos.map((video) => (
            <img
                key={video.id}
                onClick={() => onVideoSelect(video.url)}
                className="rounded transition w-full h-auto object-cover cursor-pointer hover:opacity-90"
                src={`/covers/${video.cover}.png`}
                alt={`Portada ${video.id}`}
            />
            ))}
        </div>
    );

  };
  
  export default Catalog;