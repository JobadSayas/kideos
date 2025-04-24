import { useState } from 'react';
import Video from './components/Video';
import Catalog from './components/Catalog';

function App() {
  const [currentVideo, setCurrentVideo] = useState(
    'https://www.youtube.com/embed/kLyGRfd_6Zs?enablejsapi=1&controls=0'
  );

  return (
    // <div className="bg-black flex flex-col justify-center items-center min-h-screen text-white space-y-4">
    <div className="flex flex-col justify-center items-center fixed top-0 left-0 w-full overflow-hidden touch-none bg-black h-[800px] gap-4 pb-[20px]">
      <Video url={currentVideo} />
      <Catalog onVideoSelect={setCurrentVideo} />
    </div>
  );
}

export default App;