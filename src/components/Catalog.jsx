const Catalog = ({ onVideoSelect }) => {
    const videos = [
      {
        id: 1,
        url: 'https://www.youtube.com/embed/kLyGRfd_6Zs?enablejsapi=1&controls=0'
      },
      {
        id: 2,
        url: 'https://www.youtube.com/embed/adQkOzpKrdA?si=uLvvHCBaSKJ5CoIE" title="YouTube video player" frameborder="0"'
      },
      {
        id: 3,
        url: 'https://www.youtube.com/embed/6ZcMksYGiWY?enablejsapi=1&controls=0'
      }
    ];
  
    return (
      <div className="flex gap-4">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onVideoSelect(video.url)}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            {video.title}
          </button>
        ))}
      </div>
    );
  };
  
  export default Catalog;