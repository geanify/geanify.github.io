import React, { useState } from 'react';
import Window from './Window';
import Notepad from './apps/Notepad';
import Browser from './apps/Browser';
import { FileText, Globe } from 'lucide-react';
import './WindowManager.css';

export type AppType = 'notepad' | 'browser';

interface OpenApp {
    id: string;
    type: AppType;
    title: string;
}

const WindowManager: React.FC = () => {
    const [openApps, setOpenApps] = useState<OpenApp[]>([]);
    const [activeAppId, setActiveAppId] = useState<string | null>(null);

    const openApp = (type: AppType) => {
        const id = `${type}-${Date.now()}`;
        const title = type === 'notepad' ? 'Text Editor' : 'Web Browser';
        setOpenApps([...openApps, { id, type, title }]);
        setActiveAppId(id);
    };

    const closeApp = (id: string) => {
        setOpenApps(openApps.filter(app => app.id !== id));
        if (activeAppId === id) {
            setActiveAppId(null);
        }
    };

    const focusApp = (id: string) => {
        setActiveAppId(id);
    };

    return (
        <div className="window-manager">
            <div className="desktop-icons">
                <div className="desktop-icon" onDoubleClick={() => openApp('notepad')}>
                    <FileText size={48} className="icon-img" />
                    <span>Notepad</span>
                </div>
                <div className="desktop-icon" onDoubleClick={() => openApp('browser')}>
                    <Globe size={48} className="icon-img" />
                    <span>Browser</span>
                </div>
            </div>

            {openApps.map(app => (
                <Window
                    key={app.id}
                    id={app.id}
                    title={app.title}
                    isActive={activeAppId === app.id}
                    onClose={closeApp}
                    onFocus={focusApp}
                    initialWidth={app.type === 'browser' ? 800 : 500}
                    initialHeight={app.type === 'browser' ? 600 : 400}
                    initialX={100 + (Math.random() * 50)}
                    initialY={100 + (Math.random() * 50)}
                >
                    {app.type === 'notepad' && <Notepad />}
                    {app.type === 'browser' && <Browser />}
                </Window>
            ))}
        </div>
    );
};

export default WindowManager;
