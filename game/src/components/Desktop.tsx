import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Power } from 'lucide-react';
import './Desktop.css';
import WindowManager from './WindowManager';

interface DesktopProps {
    onExit: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ onExit }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
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
                <div className="top-bar-right">
                    <div className="status-icons">
                        <Wifi size={16} />
                        <Volume2 size={16} />
                        <Battery size={16} />
                        <Power size={16} className="power-icon" onClick={onExit} />
                    </div>
                </div>
            </div>
            
            <div className="desktop-content">
                <WindowManager />
            </div>
        </div>
    );
};

export default Desktop;
