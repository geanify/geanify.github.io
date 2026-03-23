import React, { useState, useEffect, useRef, type MouseEventHandler } from 'react';
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

interface ContextMenuData {
    visible: boolean;
    x: number;
    y: number;
    href?: string;
    imgSrc?: string;
}

const Browser: React.FC = () => {
    const [tabs, setTabs] = useState<TabData[]>([{
        id: `tab-${Date.now()}`,
        history: [{ url: '', src: '', isHome: true, error: '' }],
        currentIndex: 0,
        urlInput: ''
    }]);
    const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
    const [contextMenu, setContextMenu] = useState<ContextMenuData>({ visible: false, x: 0, y: 0 });

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

    const addNewTab = (initialUrl?: string) => {
        const newTabId = `tab-${Date.now()}`;
        
        let initialHistory: HistoryEntry = { url: '', src: '', isHome: true, error: '' };
        
        if (initialUrl && typeof initialUrl === 'string') {
            const mappedUrl = resolvePotatoLink(initialUrl);
            if (mappedUrl) {
                initialHistory = {
                    url: mappedUrl.displayUrl,
                    src: mappedUrl.src,
                    isHome: false,
                    error: ''
                };
            } else {
                initialHistory = {
                    url: initialUrl,
                    src: '',
                    isHome: false,
                    error: 'Server Not Found. The .potato address could not be resolved.'
                };
            }
        }
        
        setTabs(currentTabs => [...currentTabs, {
            id: newTabId,
            history: [initialHistory],
            currentIndex: 0,
            urlInput: initialHistory.url
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

    const resolveRelativeOrAbsolute = (href: string) => {
        const parts = href.split('/');
        const siteName = parts[0];
        const path = parts.slice(1).join('/');
        
        const domain = reversePotatoLinks[siteName];
        if (domain) {
            return path ? `${domain}/${path}` : domain;
        } else {
            const currentDomain = currentEntry.url.split('/')[0];
            if (currentDomain) {
                return `${currentDomain}/${href}`;
            }
        }
        return href;
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'POTATO_NAVIGATE') {
                const href = event.data.href; 
                if (!href) return;
                
                const targetUrl = resolveRelativeOrAbsolute(href);
                if (targetUrl) {
                    if (event.data.newTab) {
                        addNewTab(targetUrl);
                    } else {
                        navigateTo(targetUrl, activeTabId);
                    }
                }
            } else if (event.data?.type === 'POTATO_CONTEXT_MENU') {
                const iframe = iframeRefs.current[activeTabId];
                let offsetX = 0;
                let offsetY = 0;
                if (iframe) {
                    const rect = iframe.getBoundingClientRect();
                    offsetX = rect.left;
                    offsetY = rect.top;
                }
                setContextMenu({
                    visible: true,
                    x: offsetX + event.data.x,
                    y: offsetY + event.data.y,
                    href: event.data.href,
                    imgSrc: event.data.imgSrc
                });
            } else if (event.data?.type === 'POTATO_CLOSE_CONTEXT_MENU') {
                setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [activeTabId, currentEntry, tabs]);

    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleIframeLoad = (tabId: string) => {
        const iframe = iframeRefs.current[tabId];
        if (!iframe || !iframe.contentWindow) return;
        try {
            const doc = iframe.contentWindow.document;
            
            const script = doc.createElement('script');
            script.textContent = `
                function handleNavigation(e) {
                    const a = e.target.closest('a');
                    if (a) {
                        const href = a.getAttribute('href');
                        if (href && !href.startsWith('http') && !href.startsWith('#')) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (e.type === 'click' && (e.button === 1 || e.ctrlKey || e.metaKey)) {
                                // Handled by auxclick or early click interception
                                return;
                            }
                            
                            // Only trigger normal navigation on standard left click
                            if (e.type === 'click' && e.button === 0 && !e.ctrlKey && !e.metaKey) {
                                window.parent.postMessage({ 
                                    type: 'POTATO_NAVIGATE', 
                                    href: href,
                                    newTab: false
                                }, '*');
                            }
                        }
                    }
                }

                // Standard left click
                document.body.addEventListener('click', handleNavigation);

                // Crucial: prevent middle-click default behaviors (like auto-scroll or opening real new tabs)
                document.body.addEventListener('mousedown', function(e) {
                    if (e.button === 1 || e.ctrlKey || e.metaKey) {
                        const a = e.target.closest('a');
                        if (a && a.getAttribute('href') && !a.getAttribute('href').startsWith('http')) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }
                }, { capture: true });

                document.body.addEventListener('click', function(e) {
                    if (e.button === 1 || e.ctrlKey || e.metaKey) {
                        const a = e.target.closest('a');
                        if (a && a.getAttribute('href') && !a.getAttribute('href').startsWith('http')) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    } else {
                        window.parent.postMessage({ type: 'POTATO_CLOSE_CONTEXT_MENU' }, '*');
                    }
                }, { capture: true });

                document.body.addEventListener('auxclick', function(e) {
                    if (e.button === 1) {
                        const a = e.target.closest('a');
                        if (a && a.getAttribute('href') && !a.getAttribute('href').startsWith('http')) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.parent.postMessage({ 
                                type: 'POTATO_NAVIGATE', 
                                href: a.getAttribute('href'),
                                newTab: true
                            }, '*');
                        }
                    }
                }, { capture: true });

                document.body.addEventListener('contextmenu', function(e) {
                    const a = e.target.closest('a');
                    const img = e.target.closest('img');
                    
                    if (a || img) {
                        e.preventDefault();
                        window.parent.postMessage({
                            type: 'POTATO_CONTEXT_MENU',
                            x: e.clientX,
                            y: e.clientY,
                            href: a ? a.getAttribute('href') : undefined,
                            imgSrc: img ? img.getAttribute('src') : undefined
                        }, '*');
                    }
                });

                document.body.addEventListener('click', function() {
                    window.parent.postMessage({ type: 'POTATO_CLOSE_CONTEXT_MENU' }, '*');
                });
            `;
            doc.body.appendChild(script);
        } catch (err) {
            console.error("Could not inject script into iframe:", err);
        }
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy', err);
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleOpenContextMenuTab = (url: string) => {
        const targetUrl = resolveRelativeOrAbsolute(url);
        if (targetUrl) {
            addNewTab(targetUrl);
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
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
                <button className="new-tab-btn" onClick={addNewTab as unknown as MouseEventHandler<HTMLButtonElement>}>
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
                                                    <a href="#" onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        setContextMenu({
                                                            visible: true,
                                                            x: e.clientX,
                                                            y: e.clientY,
                                                            href: domain
                                                        });
                                                    }} onClick={(e) => {
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
            
            {contextMenu.visible && (
                <div 
                    className="browser-context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.href && (
                        <>
                            <div className="context-menu-item" onClick={() => handleOpenContextMenuTab(contextMenu.href!)}>
                                Open link in new tab
                            </div>
                            <div className="context-menu-item" onClick={() => handleCopy(resolveRelativeOrAbsolute(contextMenu.href!) || contextMenu.href!)}>
                                Copy link address
                            </div>
                        </>
                    )}
                    {contextMenu.href && contextMenu.imgSrc && <div className="context-menu-divider" />}
                    {contextMenu.imgSrc && (
                        <>
                            <div className="context-menu-item" onClick={() => handleOpenContextMenuTab(contextMenu.imgSrc!)}>
                                Open image in new tab
                            </div>
                            <div className="context-menu-item" onClick={() => handleCopy(resolveRelativeOrAbsolute(contextMenu.imgSrc!) || contextMenu.imgSrc!)}>
                                Copy image address
                            </div>
                        </>
                    )}
                    {!contextMenu.href && !contextMenu.imgSrc && (
                        <div className="context-menu-item disabled">
                            No actions available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Browser;
