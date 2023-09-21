import React, { useState } from "react";

const Task = ({
    task,
    isEditing,
    updateCardContent,
    setEditingTaskId,
    removeCard,
    openOverlay,
    provided,
}) => {
    const [localContent, setLocalContent] = useState(task.content);
    
    return (
        <div
            className={`task ${isEditing === task.taskId ? "editing" : ""}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onDoubleClick={() => setEditingTaskId(task.taskId)}
        >
            {isEditing === task.taskId ? (
                <div className="task-content">
                    <input
                        type="text"
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        onBlur={() => updateCardContent(task.taskId, localContent)}
                    />
                    <div className="button-container">
                        <button
                            className="open-button"
                            onClick={() => openOverlay(task.taskId)}
                        >
                            Open Card
                        </button>
                        <button
                            className="remove-button"
                            onClick={() => removeCard(task.taskId)}
                        >
                            Remove Card
                        </button>
                        <button
                            className="save-button"
                            onClick={() => {
                                setEditingTaskId(null);
                            }}
                        >
                            Save Card
                        </button>
                    </div>
                </div>
            ) : (
                <div className="task-content">
                    {task.content}
                    <button
                        className="edit-button"
                        onClick={() => setEditingTaskId(task.taskId)}
                    >
                        <img
                            src={require("./edit.png")}
                            alt="Edit"
                            style={{ width: "15px", height: "15px" }}
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Task;