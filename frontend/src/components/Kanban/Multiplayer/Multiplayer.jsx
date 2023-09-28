import React, { useEffect, useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { SocketContext } from './SocketContext';
import { MultiplayerContext } from './MultiplayerContext';

// Sub-component to render each cursor
const Cursor = ({ id, pos }) => (
    <div key={id} style={{
        position: 'absolute',
        top: `${pos.y - 10}px`,
        left: `${pos.x}px`,
        zIndex: '10000'
    }}>
        <img
            src={`https://cdn.discordapp.com/avatars/${pos.discordId}/${pos.avatar}?size=80`}
            alt="Cursor"
            style={{
                width: '20px',
                height: '20px',
                boxShadow: '0px 0px 10px 2px #ffffff',
                borderRadius: '50%'
            }}
        />
        <div style={{ fontSize: '10px' }}>
            {pos.text}
        </div>
    </div>
);

// Main Multiplayer component
const Multiplayer = ({ userInfo, parentRef }) => {
    const myCursor = useRef(null);
    const socket = useContext(SocketContext);
    const { setRemoteDrags, cursors, setCursors } = useContext(MultiplayerContext);
    const cursorsRef = useRef(cursors);

    useEffect(() => {
        cursorsRef.current = cursors;
    }, [cursors]);

    useEffect(() => {
        if (!socket) return;

        const handleDragStart = (data) => {
            setRemoteDrags(prevRemoteDrags => {
                const updatedRemoteDrags = { ...prevRemoteDrags };
                updatedRemoteDrags[data.draggableId] = {
                    user: data.id,
                    cursor: {
                        x: cursorsRef.current[data.id]?.x,
                        y: cursorsRef.current[data.id]?.y
                    }
                };
                return updatedRemoteDrags;
            });
        };

        const handleDragEnd = (data) => {
            setRemoteDrags(prevRemoteDrags => {
                const updatedRemoteDrags = { ...prevRemoteDrags };
                delete updatedRemoteDrags[data.draggableId];  // Mark this item as no longer being dragged remotely
                return updatedRemoteDrags;
            });
        };

        socket.on('dragStart', handleDragStart);
        socket.on('dragEnd', handleDragEnd);

        return () => {
            socket.off('dragStart', handleDragStart);
            socket.off('dragEnd', handleDragEnd);
        };
    }, [socket, setRemoteDrags, userInfo]);

    // Socket Event Handlers
    useEffect(() => {
        const handleSocketEvents = () => {
            if (!socket) return;
            socket.on('cursorMove', handleCursorMove);
            socket.on('cursorRemove', handleCursorRemove);
            return () => {
                socket.disconnect();
            };
        };
    
        const handleCursorMove = (data) => {
            setCursors((prevCursors) => ({
                ...prevCursors,
                [data.id]: { x: data.x, y: data.y, discordId: data.discordId, avatar: data.avatar, text: data.text }
            }));
        };
    
        const handleCursorRemove = (data) => {
            setCursors((prevCursors) => {
                const updatedCursors = { ...prevCursors };
                delete updatedCursors[data.id];
                return updatedCursors;
            });
        };
        handleSocketEvents();
    }, [socket]);


    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!socket || !parentRef.current) return;
            const bounds = parentRef.current.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            myCursor.current = { x, y };  // Update cursor position
            socket.emit('cursorMove', { x, y, discordId: userInfo.discordId, avatar : userInfo.avatar, text: userInfo ? userInfo.global_name : ''});  // Include discordId
        };

        if (!parentRef.current) return;
        const current = parentRef.current;
        current.addEventListener('mousemove', handleMouseMove);
        return () => current.removeEventListener('mousemove', handleMouseMove);
    }, [parentRef, userInfo, socket]);


    return (
        <>
            {Object.entries(cursors).map(([id, pos]) => (
                <Cursor key={id} id={id} pos={pos} />
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
