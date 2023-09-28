import React, { createContext, useEffect, useState, } from 'react';

export const MultiplayerContext = createContext();

export const MultiplayerProvider = ({ children, parentRef }) => {
    const [cursors, setCursors] = useState({});
    const [remoteDrags, setRemoteDrags] = useState({});

    return (
        <MultiplayerContext.Provider
            value={{
                remoteDrags,
                setRemoteDrags,
                cursors,
                setCursors
            }}
        >
            {children}
        </MultiplayerContext.Provider>
    );
};

export default MultiplayerProvider;
