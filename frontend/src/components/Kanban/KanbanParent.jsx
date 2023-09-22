import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import KanbanBoard from './KanbanBoard';
import Multiplayer from './Multiplayer/Multiplayer';

const ChildComponent = ({ id, parentPosition }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    return (
        <div
            style={{
                position: 'absolute',
                left: parentPosition.x + position.x,
                top: parentPosition.y + position.y,
            }}
        >
            <Multiplayer />
            <KanbanBoard />
        </div>
    );
};

const ParentComponent = () => {
    const [children, setChildren] = useState([]);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Assuming you have some API or other logic to get the required information
        // to create child components
        const loadChildren = async () => {
            // ... load your child components here e.g., from an API or other logic
            // For instance, you might get an array of boards from API and set it to state like this
            setChildren([{ id: '1', parentPosition: position }]);
        };

        loadChildren();
    }, [position]);

    // Bound mousemove event listener to window
    useEffect(() => {
        const handleMouseMove = (e) => {


        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {children.map(child => <ChildComponent key={child.id} {...child} />)}
        </div>
    );
};

export default ParentComponent;
