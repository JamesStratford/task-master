import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const Multiplayer = () => {
    const socketRef = useRef();
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        socketRef.current = socketIOClient(`${process.env.REACT_APP_BACKEND_URL}`);

        socketRef.current.on('cursorMove', (data) => {
            // Update the cursor position for received socket ID
            setCursors((prevCursors) => ({ ...prevCursors, [data.id]: { x: data.x, y: data.y } }));
        });

        // ...
    }, []);

    const handleMouseMove = (event) => {
        // Emit cursor move event to the server
        socketRef.current.emit('cursorMove', { x: event.clientX, y: event.clientY });
    };

    return (
        <div onMouseMove={handleMouseMove} style={{ height: '100vh', position: 'relative' }}>
            {Object.entries(cursors).map(([id, pos]) => (
                <div key={id} style={{ position: 'absolute', top: `${pos.y}px`, left: `${pos.x}px`, width: '10px', height: '10px', backgroundColor: 'red' }}></div>
            ))}
        </div>
    );
};

export default Multiplayer;