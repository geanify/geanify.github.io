import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import './Window.css';

interface WindowProps {
    id: string;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    initialX?: number;
    initialY?: number;
    initialWidth?: number;
    initialHeight?: number;
    isActive: boolean;
    isMinimized?: boolean;
    isMaximized?: boolean;
    onClose: (id: string) => void;
    onFocus: (id: string) => void;
    onMinimize?: (id: string) => void;
    onMaximize?: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({
    id,
    title,
    children,
    initialX = 100,
    initialY = 100,
    initialWidth = 600,
    initialHeight = 400,
    isActive,
    isMinimized = false,
    isMaximized = false,
    onClose,
    onFocus,
    onMinimize,
    onMaximize
}) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return; // Don't drag if maximized
        if (e.target instanceof HTMLElement && e.target.closest('.window-controls')) return;
        
        onFocus(id);
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    if (isMinimized) return null;

    return (
        <div 
            ref={windowRef}
            className={`window ${isActive ? 'active' : ''} ${isMaximized ? 'maximized' : ''}`}
            style={{
                left: isMaximized ? 0 : position.x,
                top: isMaximized ? 0 : position.y,
                width: isMaximized ? '100%' : initialWidth,
                height: isMaximized ? '100%' : initialHeight,
                zIndex: isActive ? 100 : 10
            }}
            onMouseDown={() => onFocus(id)}
        >
            <div className="window-header" onMouseDown={handleMouseDown} onDoubleClick={() => onMaximize && onMaximize(id)}>
                <div className="window-title">{title}</div>
                <div className="window-controls">
                    <button className="win-btn minimize" onClick={(e) => { e.stopPropagation(); onMinimize && onMinimize(id); }}><Minus size={14} /></button>
                    <button className="win-btn maximize" onClick={(e) => { e.stopPropagation(); onMaximize && onMaximize(id); }}><Square size={12} /></button>
                    <button className="win-btn close" onClick={(e) => { e.stopPropagation(); onClose(id); }}><X size={14} /></button>
                </div>
            </div>
            <div className="window-content">
                {children}
            </div>
        </div>
    );
};

export default Window;
