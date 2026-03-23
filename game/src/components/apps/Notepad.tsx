import React, { useState } from 'react';
import './Notepad.css';

const Notepad: React.FC = () => {
    const [text, setText] = useState('');

    return (
        <div className="notepad-container">
            <textarea 
                className="notepad-textarea" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type here..."
                spellCheck="false"
            />
        </div>
    );
};

export default Notepad;
