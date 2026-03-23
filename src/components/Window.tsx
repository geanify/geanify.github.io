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
    onClose: (id: string) => void;
    onFocus: (id: string) => void;
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
    onClose,
    onFocus
}) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
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

    return (
        <div 
            ref={windowRef}
            className={`window ${isActive ? 'active' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                width: initialWidth,
                height: initialHeight,
                zIndex: isActive ? 100 : 10
            }}
            onMouseDown={() => onFocus(id)}
        >
            <div className="window-header" onMouseDown={handleMouseDown}>
                <div className="window-title">{title}</div>
                <div className="window-controls">
                    <button className="win-btn minimize"><Minus size={14} /></button>
                    <button className="win-btn maximize"><Square size={12} /></button>
                    <button className="win-btn close" onClick={() => onClose(id)}><X size={14} /></button>
                </div>
            </div>
            <div className="window-content">
                {children}
            </div>
        </div>
    );
};

export default Window;
