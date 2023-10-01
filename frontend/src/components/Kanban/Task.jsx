import React, { useState } from "react";

const Task = ({
    task,
    isEditing,
    updateTaskContents,
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
            <div className="task-content">
                <div className="task-labels">
                    {task.labels && task.labels.map((label, index) => (
                        <span
                            key={index}
                            className="task-label"
                            style={{
                                backgroundColor: label.color,
                                borderRadius: "3px",
                                padding: "2px 5px",
                                fontSize: "12px", // smaller font size
                                whiteSpace: "nowrap", // prevent wrapping
                                display: "inline-block", // make labels stay in line
                                marginTop: "2px",
                                marginRight: "2px", // add some space between labels
                            }}
                        >
                            {label.text}
                        </span>
                    ))}
                </div>
                {isEditing === task.taskId ? (
                    <div className="editing-content">
                        <input
                            type="text"
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={() => updateTaskContents({ ...task, content: localContent })}
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
                    <div className="non-editing-content">
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
        </div>
    );
};

export default Task;
