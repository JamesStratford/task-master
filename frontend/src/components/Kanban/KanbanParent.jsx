import React, { useState, useEffect, useRef } from 'react';
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
            <KanbanBoard />
        </div>
    );
};

const ParentComponent = ({ userInfo }) => {
    const [children, setChildren] = useState([]);
    // Get window res
    const width = window.innerWidth;
    const height = window.innerHeight * 0.75;
    

    useEffect(() => {
        // Assuming you have some API or other logic to get the required information
        // to create child components
        const loadChildren = async () => {
            // ... load your child components here e.g., from an API or other logic
            // For instance, you might get an array of boards from API and set it to state like this
            setChildren([{ id: '1', parentPosition: {x: 0, y:0} }]);
        };

        loadChildren();
    }, []);

    const parentRef = useRef();

    return (
        <div ref={parentRef} id="parent" style={{ position: 'relative', width, height, backgroundColor: 'black', overflow: 'hidden' }}>
            <div ref={parentRef} style={{ position: 'relative' }}>
                {children.map(child =>
                    <ChildComponent key={child.id} {...child} />
                )}
                <Multiplayer userInfo={userInfo} parentRef={parentRef} />
            </div>
        </div>
    );
};

export default ParentComponent;
