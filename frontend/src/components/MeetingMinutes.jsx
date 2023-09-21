import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function MeetingMinutes() {
  const [tasks, setTasks] = useState([]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTasks(reorderedTasks);
  };

  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      content: 'Meeting',
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="meeting-minutes" direction="vertical">
        {(provided) => (
          <div
            className="meeting-minutes"
            style={{ width: '80%', margin: '0 auto' }} // Make column larger
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <h2>Attendance Tracker</h2>
            {tasks.map((task, index) => (
              <Draggable draggableId={task.id} index={index} key={task.id}>
                {(provided) => (
                  <div
                    className="task"
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    {task.content}
                    <button
                      className="remove-button"
                      onClick={() => removeTask(task.id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <button
              onClick={addTask}
              className="add-task-button"
            >
              + Add a meeting
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default MeetingMinutes;
