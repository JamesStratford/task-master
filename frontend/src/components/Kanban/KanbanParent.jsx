import React, { useState, useEffect, useRef } from 'react';
import KanbanBoard from './KanbanBoard';
import Multiplayer from './Multiplayer/Multiplayer';
import { SocketProvider } from './Multiplayer/SocketContext';
import { KanbanProvider } from './Multiplayer/KanbanContext';
import { MultiplayerProvider } from './Multiplayer/MultiplayerContext';

const ChildComponent = ({ id, userInfo, parentPosition }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    return (
        <div
            style={{
                position: 'absolute',
                left: parentPosition.x + position.x,
                top: parentPosition.y + position.y,
            }}
        >
            <KanbanBoard userInfo={userInfo} />
        </div>
    );
};

const ParentComponent = ({ userInfo }) => {
    const [children, setChildren] = useState([]);
    const parentRef = useRef();  // Reference for the parent div

    const width = window.innerWidth;
    const height = window.innerHeight * 0.75;

    useEffect(() => {
        const loadChildren = async () => {
            try {
                // ... load your child components here e.g., from an API or other logic
                setChildren([{ id: '1', parentPosition: { x: 0, y: 0 } }]);
            } catch (error) {
                console.error('Error loading children:', error);
            }
        };

        loadChildren();
    }, []);  // Empty dependency array if no outside variables are used

    return (
        <SocketProvider>
            <KanbanProvider>
                <MultiplayerProvider parentRef={parentRef}>
                    <div
                        ref={parentRef}
                        id="parent"
                        style={{
                            position: 'relative',
                            width,
                            height,
                            backgroundColor: 'black',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            {children.map(child =>
                                <ChildComponent userInfo={userInfo} key={child.id} {...child} />
                            )}
                            <Multiplayer userInfo={userInfo} parentRef={parentRef} />
                        </div>
                    </div>
                </MultiplayerProvider>
            </KanbanProvider>
        </SocketProvider>
    );
};

export default ParentComponent;
