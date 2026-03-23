import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';
import { resolvePotatoLink, potatoLinks, reversePotatoLinks } from '../../utils/potatoLinks';
import './Browser.css';

const Browser: React.FC = () => {
    const [urlInput, setUrlInput] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [iframeSrc, setIframeSrc] = useState('');
    const [isHome, setIsHome] = useState(true);
    const [error, setError] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const navigateTo = (url: string) => {
        if (!url) return;
        
        const mappedUrl = resolvePotatoLink(url);
        if (mappedUrl) {
            setIframeSrc(mappedUrl.src);
            setCurrentUrl(mappedUrl.displayUrl);
            setUrlInput(mappedUrl.displayUrl);
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

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'POTATO_NAVIGATE') {
                const href = event.data.href; // e.g. "blog/article.html"
                if (!href) return;
                
                const parts = href.split('/');
                const siteName = parts[0];
                const path = parts.slice(1).join('/');
                
                const domain = reversePotatoLinks[siteName];
                if (domain) {
                    const targetUrl = path ? `${domain}/${path}` : domain;
                    navigateTo(targetUrl);
                } else {
                    // Try to treat it as a relative link from the current domain
                    const currentDomain = currentUrl.split('/')[0];
                    if (currentDomain) {
                        navigateTo(`${currentDomain}/${href}`);
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentUrl]);

    const handleIframeLoad = () => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;
        try {
            const doc = iframeRef.current.contentWindow.document;
            
            // Inject a script to handle link clicks natively within the iframe
            const script = doc.createElement('script');
            script.textContent = `
                document.body.addEventListener('click', function(e) {
                    const a = e.target.closest('a');
                    if (a) {
                        const href = a.getAttribute('href');
                        if (href && !href.startsWith('http') && !href.startsWith('#')) {
                            e.preventDefault();
                            window.parent.postMessage({ type: 'POTATO_NAVIGATE', href: href }, '*');
                        }
                    }
                });
            `;
            doc.body.appendChild(script);
        } catch (err) {
            console.error("Could not inject script into iframe:", err);
        }
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
                                {Object.keys(potatoLinks).map(domain => (
                                    <li key={domain}>
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            navigateTo(domain);
                                        }}>{domain}</a> - {potatoLinks[domain]}
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
                        ref={iframeRef}
                        src={iframeSrc} 
                        onLoad={handleIframeLoad}
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
