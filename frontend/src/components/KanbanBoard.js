import React, { useState } from 'react';
import initialData from './initialData';
import Column from './column';

function KanbanBoard() {
  const [state, setState] = useState(initialData);

  return state.columnOrder.map((columnId) => {
    const column = state.columns[columnId];
    const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

    return <Column key={column.id} column={column} tasks={tasks} />;
  });
}

export default KanbanBoard;
