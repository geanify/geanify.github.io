import { useState } from 'react';
import Desktop from './components/Desktop';
import LoginScreen from './components/LoginScreen';
import { levels } from './config/levels';
import { initializeLinks } from './utils/potatoLinks';
import './index.css';

function App() {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);

  const handleStartGame = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      initializeLinks(level.folder, level.websites);
      setCurrentLevel(levelId);
    }
  };

  const handleExitGame = () => {
    setCurrentLevel(null);
  };

  if (!currentLevel) {
    return <LoginScreen onStartGame={handleStartGame} />;
  }

  return (
    <Desktop onExit={handleExitGame} />
  );
}

export default App;
