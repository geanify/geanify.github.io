import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home, Plus, X } from 'lucide-react';
import { resolvePotatoLink, potatoLinks, reversePotatoLinks } from '../../utils/potatoLinks';
import './Browser.css';

interface HistoryEntry {
    url: string;
    src: string;
    isHome: boolean;
    error: string;
}

interface TabData {
    id: string;
    history: HistoryEntry[];
    currentIndex: number;
    urlInput: string;
}

const Browser: React.FC = () => {
    const [tabs, setTabs] = useState<TabData[]>([{
        id: `tab-${Date.now()}`,
        history: [{ url: '', src: '', isHome: true, error: '' }],
        currentIndex: 0,
        urlInput: ''
    }]);
    const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

    const activeTab = tabs.find(t => t.id === activeTabId)!;
    const currentEntry = activeTab.history[activeTab.currentIndex];

    // Create a stable reference to iframeRefs to inject scripts
    const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

    const updateTab = (tabId: string, updater: (tab: TabData) => TabData) => {
        setTabs(currentTabs => currentTabs.map(t => t.id === tabId ? updater(t) : t));
    };

    const navigateTo = (url: string, tabId: string = activeTabId) => {
        if (!url) return;
        
        const mappedUrl = resolvePotatoLink(url);
        
        updateTab(tabId, (tab) => {
            const newHistory = tab.history.slice(0, tab.currentIndex + 1);
            let newEntry: HistoryEntry;

            if (mappedUrl) {
                newEntry = {
                    url: mappedUrl.displayUrl,
                    src: mappedUrl.src,
                    isHome: false,
                    error: ''
                };
            } else {
                newEntry = {
                    url: url,
                    src: '',
                    isHome: false,
                    error: 'Server Not Found. The .potato address could not be resolved.'
                };
            }

            newHistory.push(newEntry);

            return {
                ...tab,
                history: newHistory,
                currentIndex: newHistory.length - 1,
                urlInput: newEntry.url
            };
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigateTo(activeTab.urlInput);
        }
    };

    const goHome = () => {
        updateTab(activeTabId, (tab) => {
            const newHistory = tab.history.slice(0, tab.currentIndex + 1);
            newHistory.push({ url: '', src: '', isHome: true, error: '' });
            return {
                ...tab,
                history: newHistory,
                currentIndex: newHistory.length - 1,
                urlInput: ''
            };
        });
    };

    const goBack = () => {
        if (activeTab.currentIndex > 0) {
            updateTab(activeTabId, (tab) => {
                const prevIndex = tab.currentIndex - 1;
                return {
                    ...tab,
                    currentIndex: prevIndex,
                    urlInput: tab.history[prevIndex].url
                };
            });
        }
    };

    const goForward = () => {
        if (activeTab.currentIndex < activeTab.history.length - 1) {
            updateTab(activeTabId, (tab) => {
                const nextIndex = tab.currentIndex + 1;
                return {
                    ...tab,
                    currentIndex: nextIndex,
                    urlInput: tab.history[nextIndex].url
                };
            });
        }
    };

    const addNewTab = () => {
        const newTabId = `tab-${Date.now()}`;
        setTabs([...tabs, {
            id: newTabId,
            history: [{ url: '', src: '', isHome: true, error: '' }],
            currentIndex: 0,
            urlInput: ''
        }]);
        setActiveTabId(newTabId);
    };

    const closeTab = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        if (tabs.length === 1) {
            // Reset the only tab if we close it
            setTabs([{
                id: `tab-${Date.now()}`,
                history: [{ url: '', src: '', isHome: true, error: '' }],
                currentIndex: 0,
                urlInput: ''
            }]);
            return;
        }

        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);
        if (activeTabId === tabId) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'POTATO_NAVIGATE') {
                const href = event.data.href; 
                if (!href) return;
                
                const parts = href.split('/');
                const siteName = parts[0];
                const path = parts.slice(1).join('/');
                
                const domain = reversePotatoLinks[siteName];
                if (domain) {
                    const targetUrl = path ? `${domain}/${path}` : domain;
                    navigateTo(targetUrl, activeTabId);
                } else {
                    const currentDomain = currentEntry.url.split('/')[0];
                    if (currentDomain) {
                        navigateTo(`${currentDomain}/${href}`, activeTabId);
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [activeTabId, currentEntry]);

    const handleIframeLoad = (tabId: string) => {
        const iframe = iframeRefs.current[tabId];
        if (!iframe || !iframe.contentWindow) return;
        try {
            const doc = iframe.contentWindow.document;
            
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
            <div className="browser-tabs-bar">
                {tabs.map(tab => (
                    <div 
                        key={tab.id} 
                        className={`browser-tab ${activeTabId === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTabId(tab.id)}
                    >
                        <span className="tab-title">
                            {tab.history[tab.currentIndex].isHome ? 'New Tab' : tab.history[tab.currentIndex].url || 'Loading...'}
                        </span>
                        <div className="tab-close" onClick={(e) => closeTab(e, tab.id)}>
                            <X size={12} />
                        </div>
                    </div>
                ))}
                <button className="new-tab-btn" onClick={addNewTab}>
                    <Plus size={16} />
                </button>
            </div>

            <div className="browser-toolbar">
                <button className="nav-btn" disabled={activeTab.currentIndex === 0} onClick={goBack}>
                    <ArrowLeft size={16} />
                </button>
                <button className="nav-btn" disabled={activeTab.currentIndex === activeTab.history.length - 1} onClick={goForward}>
                    <ArrowRight size={16} />
                </button>
                <button className="nav-btn" onClick={() => currentEntry.src ? navigateTo(currentEntry.url) : null}>
                    <RotateCw size={16} />
                </button>
                <button className="nav-btn" onClick={goHome}>
                    <Home size={16} />
                </button>
                
                <div className="address-bar-container">
                    <input 
                        type="text" 
                        className="address-bar"
                        value={activeTab.urlInput}
                        onChange={(e) => updateTab(activeTabId, t => ({ ...t, urlInput: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter .potato address..."
                    />
                </div>
                
                <button className="nav-btn primary" onClick={() => navigateTo(activeTab.urlInput)}>
                    <Search size={16} />
                </button>
            </div>
            
            <div className="browser-content">
                {tabs.map(tab => {
                    const entry = tab.history[tab.currentIndex];
                    return (
                        <div key={tab.id} className="tab-content" style={{ display: activeTabId === tab.id ? 'block' : 'none' }}>
                            {entry.isHome ? (
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
                                                        navigateTo(domain, tab.id);
                                                    }}>{domain}</a> - {potatoLinks[domain]}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : entry.error ? (
                                <div className="browser-error">
                                    <h2>{entry.error}</h2>
                                    <p>Check the address for typing errors such as ww.example.potato instead of www.example.potato</p>
                                </div>
                            ) : (
                                <iframe 
                                    ref={(el) => { iframeRefs.current[tab.id] = el; }}
                                    src={entry.src} 
                                    onLoad={() => handleIframeLoad(tab.id)}
                                    className="browser-iframe" 
                                    title={`browser-view-${tab.id}`}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Browser;
