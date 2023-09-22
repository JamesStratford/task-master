import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const Multiplayer = () => {
    const socketRef = useRef();
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        socketRef.current = socketIOClient(`${process.env.REACT_APP_BACKEND_URL}`);

        socketRef.current.on('cursorMove', (data) => {
            setCursors((prevCursors) => ({ ...prevCursors, [data.id]: { x: data.x, y: data.y } }));
        });
    }, []);

    const handleMouseMove = (event) => {
        // Emit cursor move event to the server
        socketRef.current.emit('cursorMove', { x: event.clientX, y: event.clientY });
    };

    return (
        <div onMouseMove={handleMouseMove} style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'all',
            zIndex: '9999', // Set a very high z-index value
            backgroundColor: 'rgba(0,0,0,0.1)' // Temporary: Set a semi-transparent background color to verify visibility
        }}>
            {Object.entries(cursors).map(([id, pos]) => (
                <div
                    key={id}
                    style={{
                        position: 'absolute',
                        top: `${pos.y}px`,
                        left: `${pos.x}px`,
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        pointerEvents: 'all',
                        zIndex: '10000'  // Ensure cursor divs are above the overlay
                    }}
                ></div>
            ))}
        </div>
    );
};

export default Multiplayer;