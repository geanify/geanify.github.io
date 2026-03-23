import React, { useState } from 'react';
import { levels } from '../config/levels';
import './LoginScreen.css';

interface LoginScreenProps {
    onStartGame: (levelId: string) => void;
}

type MenuState = 'main' | 'levelSelect' | 'credits';

const LoginScreen: React.FC<LoginScreenProps> = ({ onStartGame }) => {
    const [menuState, setMenuState] = useState<MenuState>('main');

    return (
        <div className="login-screen">
            <div className="login-container">
                <h1 className="game-title">OS::NEXUS</h1>
                
                {menuState === 'main' && (
                    <div className="menu-options">
                        <button className="menu-btn" onClick={() => setMenuState('levelSelect')}>
                            New Game
                        </button>
                        <button className="menu-btn" onClick={() => setMenuState('credits')}>
                            Credits
                        </button>
                    </div>
                )}

                {menuState === 'levelSelect' && (
                    <div className="menu-options">
                        <h2>Select Level</h2>
                        {levels.map(level => (
                            <button 
                                key={level.id} 
                                className="menu-btn level-btn"
                                onClick={() => onStartGame(level.id)}
                            >
                                {level.name}
                            </button>
                        ))}
                        <button className="menu-btn back-btn" onClick={() => setMenuState('main')}>
                            Back
                        </button>
                    </div>
                )}

                {menuState === 'credits' && (
                    <div className="menu-options credits-view">
                        <h2>Credits</h2>
                        <p>Game created for hackers, by hackers.</p>
                        <p>Everything operates within the system.</p>
                        <button className="menu-btn back-btn" onClick={() => setMenuState('main')}>
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;
