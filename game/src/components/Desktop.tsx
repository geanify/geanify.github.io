import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Volume2, Power, LogOut } from 'lucide-react';
import './Desktop.css';
import WindowManager from './WindowManager';

interface DesktopProps {
    onExit: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ onExit }) => {
    const [time, setTime] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="desktop">
            <div className="top-bar">
                <div className="top-bar-left">
                    <span className="activities-btn">Activities</span>
                </div>
                <div className="top-bar-center">
                    <span className="date-time">{formatDate(time)} {formatTime(time)}</span>
                </div>
                <div className="top-bar-right" ref={menuRef}>
                    <div 
                        className={`status-icons ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Wifi size={16} />
                        <Volume2 size={16} />
                        <Battery size={16} />
                        <Power size={16} className="power-icon" />
                    </div>

                    {isMenuOpen && (
                        <div className="status-dropdown">
                            <div className="dropdown-section">
                                <div className="dropdown-item">
                                    <Volume2 size={16} />
                                    <span>Volume</span>
                                </div>
                                <div className="dropdown-item">
                                    <Wifi size={16} />
                                    <span>Wi-Fi Connected</span>
                                </div>
                                <div className="dropdown-item">
                                    <Battery size={16} />
                                    <span>Battery 100%</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-section">
                                <div className="dropdown-item" onClick={() => { setShowLogoutConfirm(true); setIsMenuOpen(false); }}>
                                    <LogOut size={16} />
                                    <span>Log off</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="desktop-content">
                <WindowManager />
            </div>

            {showLogoutConfirm && (
                <div className="logout-overlay">
                    <div className="logout-dialog">
                        <h2>Log Off</h2>
                        <p>Are you sure you want to log off? All progress will be lost.</p>
                        <div className="logout-dialog-buttons">
                            <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={onExit}>Log Off</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Desktop;
