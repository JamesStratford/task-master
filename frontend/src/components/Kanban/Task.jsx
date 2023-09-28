import React, { useState, useContext, useEffect } from "react";
import { MultiplayerContext } from "./Multiplayer/MultiplayerContext";

const Task = ({
    task,
    isEditing,
    updateCardContent,
    setEditingTaskId,
    removeCard,
    openOverlay,
    provided,
    style
}) => {
    const [localContent, setLocalContent] = useState(task.content);
    const { remoteDrags, cursors } = useContext(MultiplayerContext);  // Access both state variables in one useContext call
    const isBeingDraggedRemotely = remoteDrags.hasOwnProperty(task.taskId);
    const remoteDrag = isBeingDraggedRemotely ? remoteDrags[task.taskId] : null;
    const cursor = cursors[remoteDrag?.user];
    const cursorPosition = cursor;

    useEffect(() => {
        console.log(remoteDrag)
        console.log(cursors)
        console.log(cursor)
    }, [cursor, remoteDrag])

    const modifiedStyle = isBeingDraggedRemotely && cursorPosition
        ? {
            ...style,
            position: 'absolute',
            top: cursorPosition.y,
            left: cursorPosition.x,
        }
        : style;

    return (
        <div
            className={`task ${isEditing === task.taskId ? "editing" : ""}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onDoubleClick={() => setEditingTaskId(task.taskId)}
            style={modifiedStyle}
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