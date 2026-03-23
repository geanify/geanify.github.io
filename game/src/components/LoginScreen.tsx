import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { levels } from '../config/levels';
import './LoginScreen.css';

interface LoginScreenProps {
    onStartGame: (levelId: string) => void;
}

type MenuState = 'userSelect' | 'login' | 'credits';

const LoginScreen: React.FC<LoginScreenProps> = ({ onStartGame }) => {
    const [menuState, setMenuState] = useState<MenuState>('userSelect');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const handleUserSelect = (levelId: string) => {
        setSelectedUser(levelId);
        setMenuState('login');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            onStartGame(selectedUser);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-container">
                <h1 className="game-title">OS::NEXUS</h1>
                
                {menuState === 'userSelect' && (
                    <div className="user-select-view">
                        <h2>Select User</h2>
                        <div className="user-list">
                            {levels.map(level => (
                                <div 
                                    key={level.id} 
                                    className="user-card"
                                    onClick={() => handleUserSelect(level.id)}
                                >
                                    <div className="user-avatar">
                                        <User size={40} />
                                    </div>
                                    <span className="user-name">{level.name}</span>
                                </div>
                            ))}
                        </div>
                        <button className="text-btn mt-4" onClick={() => setMenuState('credits')}>
                            System Credits
                        </button>
                    </div>
                )}

                {menuState === 'login' && (
                    <div className="password-view">
                        <div className="user-avatar large">
                            <User size={48} />
                        </div>
                        <h2>{levels.find(l => l.id === selectedUser)?.name}</h2>
                        
                        <form onSubmit={handleLogin} className="password-form">
                            <div className="password-input-wrapper">
                                <Lock size={16} className="lock-icon" />
                                <input 
                                    type="password" 
                                    autoFocus
                                    placeholder="Enter password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="submit" className="login-submit-btn">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>

                        <button className="text-btn mt-4" onClick={() => {
                            setMenuState('userSelect');
                            setPassword('');
                        }}>
                            Cancel
                        </button>
                    </div>
                )}

                {menuState === 'credits' && (
                    <div className="credits-view">
                        <h2>Credits</h2>
                        <p>Game created for hackers, by hackers.</p>
                        <p>Everything operates within the system.</p>
                        <button className="text-btn mt-4" onClick={() => setMenuState('userSelect')}>
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;
