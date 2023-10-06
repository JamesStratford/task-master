import React, { createContext, useState, } from 'react';

export const KanbanContext = createContext();

export const KanbanProvider = ({ children }) => {
    const [kanbanColumns, setKanbanColumns] = useState({
        tasks: {},
        columns: [],
      });

    return (
        <KanbanContext.Provider
            value={{
                kanbanColumns,
                setKanbanColumns,
            }}
        >
            {children}
        </KanbanContext.Provider>
    );
};

export default KanbanProvider;
