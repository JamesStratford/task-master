import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

const Multiplayer = ({ userInfo, parentRef }) => {
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

        socketRef.current.on('cursorRemove', (data) => {
            setCursors((prevCursors) => {
                const updatedCursors = { ...prevCursors };
                delete updatedCursors[data.id];
                return updatedCursors;
            });
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!parentRef.current) return;
        const handleMouseMove = (event) => {
            const bounds = parentRef.current.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;

            socketRef.current.emit('cursorMove', { x, y, text: userInfo ? userInfo : '' });
        };

        const current = parentRef.current;
        current.addEventListener('mousemove', handleMouseMove);
        return () => current.removeEventListener('mousemove', handleMouseMove);
    }, [parentRef, userInfo]);


    return (
        <>
            {/* Rendering cursors using transformed coordinates */}
            {Object.entries(cursors).map(([id, pos]) => (
                <div key={id} style={{
                    position: 'absolute',
                    top: `${pos.y - 10}px`,
                    left: `${pos.x}px`,
                    zIndex: '10000'
                }}>
                    <img
                        src={`https://cdn.discordapp.com/avatars/${pos.text.discordId}/${pos.text.avatar}?size=80`}
                        alt="Cursor"
                        style={{
                            width: '20px', // adjust as needed
                            height: '20px', // adjust as needed
                            boxShadow: '0px 0px 10px 2px #ffffff', // glow effect
                            borderRadius: '50%', // rounded corners
                        }}
                    />
                    <div style={{
                        fontSize: '10px', // adjust as needed
                        //... other styles for text, if needed
                    }}>{pos.text.global_name}</div>
                </div>
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