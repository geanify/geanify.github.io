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
    isMinimized: boolean;
    isMaximized: boolean;
}

const WindowManager: React.FC = () => {
    const [openApps, setOpenApps] = useState<OpenApp[]>([]);
    const [activeAppId, setActiveAppId] = useState<string | null>(null);

    const openApp = (type: AppType) => {
        const id = `${type}-${Date.now()}`;
        const title = type === 'notepad' ? 'Text Editor' : 'Web Browser';
        setOpenApps([...openApps, { id, type, title, isMinimized: false, isMaximized: false }]);
        setActiveAppId(id);
    };

    const closeApp = (id: string) => {
        setOpenApps(openApps.filter(app => app.id !== id));
        if (activeAppId === id) {
            setActiveAppId(null);
        }
    };

    const focusApp = (id: string) => {
        setOpenApps(apps => apps.map(app => 
            app.id === id ? { ...app, isMinimized: false } : app
        ));
        setActiveAppId(id);
    };

    const toggleMinimize = (id: string) => {
        setOpenApps(apps => apps.map(app => {
            if (app.id === id) {
                const newMinimized = !app.isMinimized;
                if (newMinimized && activeAppId === id) {
                    setActiveAppId(null);
                }
                return { ...app, isMinimized: newMinimized };
            }
            return app;
        }));
    };

    const toggleMaximize = (id: string) => {
        setOpenApps(apps => apps.map(app => 
            app.id === id ? { ...app, isMaximized: !app.isMaximized } : app
        ));
        setActiveAppId(id);
    };

    const getAppIcon = (type: AppType, size: number = 24) => {
        return type === 'notepad' ? <FileText size={size} /> : <Globe size={size} />;
    };

    return (
        <div className="window-manager">
            <div className="desktop-icons">
                <div className="desktop-icon" onDoubleClick={() => openApp('notepad')}>
                    {getAppIcon('notepad', 48)}
                    <span>Notepad</span>
                </div>
                <div className="desktop-icon" onDoubleClick={() => openApp('browser')}>
                    {getAppIcon('browser', 48)}
                    <span>Browser</span>
                </div>
            </div>

            {openApps.map(app => (
                <Window
                    key={app.id}
                    id={app.id}
                    title={app.title}
                    isActive={activeAppId === app.id}
                    isMinimized={app.isMinimized}
                    isMaximized={app.isMaximized}
                    onClose={closeApp}
                    onFocus={focusApp}
                    onMinimize={toggleMinimize}
                    onMaximize={toggleMaximize}
                    initialWidth={app.type === 'browser' ? 800 : 500}
                    initialHeight={app.type === 'browser' ? 600 : 400}
                    initialX={100 + (Math.random() * 50)}
                    initialY={100 + (Math.random() * 50)}
                >
                    {app.type === 'notepad' && <Notepad />}
                    {app.type === 'browser' && <Browser />}
                </Window>
            ))}

            {openApps.length > 0 && (
                <div className="taskbar">
                    <div className="taskbar-apps">
                        {openApps.map(app => (
                            <div 
                                key={app.id}
                                className={`taskbar-item ${activeAppId === app.id ? 'active' : ''} ${app.isMinimized ? 'minimized' : ''}`}
                                onClick={() => app.isMinimized || activeAppId !== app.id ? focusApp(app.id) : toggleMinimize(app.id)}
                            >
                                {getAppIcon(app.type, 16)}
                                <span className="taskbar-title">{app.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WindowManager;
