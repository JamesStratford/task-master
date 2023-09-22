import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

const Multiplayer = ({userInfo}) => {
    const socketRef = useRef();
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        socketRef.current = socketIOClient(`${process.env.REACT_APP_BACKEND_URL}`);

        socketRef.current.on('cursorMove', (data) => {
            setCursors((prevCursors) => ({ 
                ...prevCursors, 
                [data.id]: { x: data.x, y: data.y, text: data.text } 
            }));
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        // Attach mousemove event listener to the document
        const handleMouseMove = (event) => {
            // Emit cursor move event to the server
            console.log(userInfo)
            socketRef.current.emit('cursorMove', { x: event.clientX, y: event.clientY, text: userInfo.global_name });
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Clean up the event listener when the component unmounts
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '9999'
            }} />
            {Object.entries(cursors).map(([id, pos]) => (
                <div key={id} style={{
                    position: 'absolute',
                    top: `${pos.y}px`,
                    left: `${pos.x}px`,
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    pointerEvents: 'all',
                    zIndex: '10000'
                }}>{pos.text}</div>
            ))}
        </>
    );
};

Multiplayer.propTypes = {
    userInfo: PropTypes.shape({
        global_name: PropTypes.string.isRequired
    }).isRequired
};

export default Multiplayer;