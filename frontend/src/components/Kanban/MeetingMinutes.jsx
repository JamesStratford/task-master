import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardOverlay from './CardOverlay';

function MeetingMinutes() {
    // State variables
    const [tasks, setTasks] = useState({});
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    const openOverlay = (taskId) => {
        const task = tasks[taskId];
        setCurrentTask(task);
        setIsOverlayOpen(true);
    };

    const closeOverlay = () => {
        setIsOverlayOpen(false);
    };

    const addTask = () => {
        const newTaskId = `new-task-${Date.now()}`;
        const newTask = {
            id: newTaskId,
            content: 'New Meeting',
            description: '',
        };
        setTasks({
            ...tasks,
            [newTaskId]: newTask,
        });
    };

    const updateTaskContent = (taskId, newContent) => {
        setTasks({
            ...tasks,
            [taskId]: {
                ...tasks[taskId],
                content: newContent,
            },
        });
    };

    const onDragEnd = (result) => {
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="meeting-attendance-column" direction="vertical">
                {(provided) => (
                    <div className="column-container" ref={provided.innerRef} {...provided.droppableProps}>
                        <h3 className="column-title">Meeting Attendance</h3>
                        {Object.values(tasks).map((task, index) => (
                            <Draggable draggableId={task.id} index={index} key={task.id}>
                                {(provided) => (
                                    <div
                                        className={`task ${editingTaskId === task.id ? 'editing' : ''}`}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        onDoubleClick={() => setEditingTaskId(task.id)}
                                    >
                                        {editingTaskId === task.id ? (
                                            <div className="task-content">
                                                <input
                                                    type="text"
                                                    value={task.content}
                                                    onChange={(e) => updateTaskContent(task.id, e.target.value)}
                                                />
                                                <button className="open-button" onClick={() => openOverlay(task.id)}>
                                                    Meeting Details
                                                </button>
                                                <button className="save-button" onClick={() => setEditingTaskId(null)}>
                                                    Save Meeting Details
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="task-content">
                                                {task.content}
                                                <button className="edit-button" onClick={() => setEditingTaskId(task.id)}>
                                                    <img src={require('./edit.png')} alt="Edit" style={{ width: '15px', height: '15px' }} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        <button onClick={addTask} className="add-card-button">
                            +Add
                        </button>
                    </div>
                )}
            </Droppable>
            {isOverlayOpen && (
                <CardOverlay
                    task={currentTask}
                    onClose={closeOverlay}
                    // other required props for CardOverlay can be passed here
                />
            )}
        </DragDropContext>
    );
}

export default MeetingMinutes;
