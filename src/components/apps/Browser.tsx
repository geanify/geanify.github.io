import React, { useState } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';
import { resolvePotatoLink, potatoLinks } from '../../utils/potatoLinks';
import './Browser.css';

const Browser: React.FC = () => {
    const [urlInput, setUrlInput] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [iframeSrc, setIframeSrc] = useState('');
    const [isHome, setIsHome] = useState(true);
    const [error, setError] = useState('');

    const navigateTo = (url: string) => {
        if (!url) return;
        
        const mappedUrl = resolvePotatoLink(url);
        if (mappedUrl) {
            setIframeSrc(mappedUrl);
            setCurrentUrl(url);
            setUrlInput(url);
            setIsHome(false);
            setError('');
        } else {
            setError('Server Not Found. The .potato address could not be resolved.');
            setCurrentUrl(url);
            setUrlInput(url);
            setIsHome(false);
            setIframeSrc('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigateTo(urlInput);
        }
    };

    const goHome = () => {
        setIsHome(true);
        setUrlInput('');
        setCurrentUrl('');
        setIframeSrc('');
        setError('');
    };

    return (
        <div className="browser-container">
            <div className="browser-toolbar">
                <button className="nav-btn" disabled><ArrowLeft size={16} /></button>
                <button className="nav-btn" disabled><ArrowRight size={16} /></button>
                <button className="nav-btn" onClick={() => iframeSrc ? navigateTo(currentUrl) : null}><RotateCw size={16} /></button>
                <button className="nav-btn" onClick={goHome}><Home size={16} /></button>
                
                <div className="address-bar-container">
                    <input 
                        type="text" 
                        className="address-bar"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter .potato address..."
                    />
                </div>
                
                <button className="nav-btn primary" onClick={() => navigateTo(urlInput)}>
                    <Search size={16} />
                </button>
            </div>
            
            <div className="browser-content">
                {isHome ? (
                    <div className="browser-home">
                        <h1>Torr Browser</h1>
                        <p>Welcome to the decentralized web.</p>
                        <div className="links-directory">
                            <h3>Hidden Directory (For testing)</h3>
                            <ul>
                                {Object.keys(potatoLinks).map(link => (
                                    <li key={link}>
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            navigateTo(link);
                                        }}>{link}</a> - {potatoLinks[link]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : error ? (
                    <div className="browser-error">
                        <h2>{error}</h2>
                        <p>Check the address for typing errors such as ww.example.potato instead of www.example.potato</p>
                    </div>
                ) : (
                    <iframe 
                        src={iframeSrc} 
                        className="browser-iframe" 
                        title="browser-view"
                        sandbox="allow-scripts allow-same-origin"
                    />
                )}
            </div>
        </div>
    );
};

export default Browser;
