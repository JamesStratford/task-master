import React, { createContext, useState, } from 'react';

export const MultiplayerContext = createContext();

export const MultiplayerProvider = ({ children, parentRef }) => {
    const [remoteDrags, setRemoteDrags] = useState({});

    return (
        <MultiplayerContext.Provider
            value={{
                remoteDrags,
                setRemoteDrags
            }}
        >
            {children}
        </MultiplayerContext.Provider>
    );
};

export default MultiplayerProvider;
