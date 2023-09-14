const initialData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      content: 'Take out the garbage',
      column: 'column-1', // Add the column property
    },
    'task-2': {
      id: 'task-2',
      content: 'Watch my favorite show',
      column: 'column-1', // Add the column property
    },
    'task-3': {
      id: 'task-3',
      content: 'Charge my phone',
      column: 'column-1', // Add the column property
    },
    'task-4': {
      id: 'task-4',
      content: 'Cook dinner',
      column: 'column-1', // Add the column property
    },
    'task-5': {
      id: 'task-5',
      content: 'Check the batteries',
      column: 'column-2', // Add the column property
    },
    'task-6': {
      id: 'task-6',
      content: 'Cook pasta',
      column: 'column-2', // Add the column property
    },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'column-2': {
      id: 'column-2',
      title: 'List',
      taskIds: ['task-5', 'task-6'],
    },
  },
  columnOrder: ['column-1', 'column-2'],
};

export default initialData;
