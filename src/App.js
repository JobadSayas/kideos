import { useState } from 'react';
import Video from './components/Video';
import Catalog from './components/Catalog';

function App() {
  const [currentVideo, setCurrentVideo] = useState(
    'https://www.youtube.com/embed/kLyGRfd_6Zs?enablejsapi=1&controls=0'
  );

  return (
    <div className="bg-black flex flex-col justify-center items-center min-h-screen text-white space-y-4">
      <Video url={currentVideo} />
      <Catalog onVideoSelect={setCurrentVideo} />
    </div>
  );
}

export default App;