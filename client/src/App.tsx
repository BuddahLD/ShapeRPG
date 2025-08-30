import React, { useEffect } from "react";
import Game from "./components/Game";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const { setBackgroundMusic } = useAudio();

  useEffect(() => {
    // Initialize background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
  }, [setBackgroundMusic]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      <Game />
    </div>
  );
}

export default App;
