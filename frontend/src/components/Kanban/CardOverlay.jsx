import React, { useState, useEffect } from "react";
import LabelOverlay from "./LabelOverlay";
import axios from "axios";

function CardOverlay({
  task,
  onClose,
  updateTaskContents,
  allLabels,
  setAllLabels,
  users,
  setUsers,
}) {
  const [description, setDescription] = useState(task.description || "");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [cardLabels, setCardLabels] = useState(task.labels || []);
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false);
  const [startDate, setStartDate] = useState(task.startDate);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [selectedUser, setSelectedUser] = useState(task.assignedUser || "");
  const [selectedUsername, setSelectedUsername] = useState("");

  useEffect(() => {
    handleUpdateTask();
  }, [startDate, dueDate, selectedUsername]);

  useEffect(() => {
    const selectedUserObject = users.find((user) => user.id === selectedUser);
    setSelectedUsername(selectedUserObject ? selectedUserObject.username : "");
  }, [selectedUser, users]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCancelEdit = () => {
    setDescription(task.description || "");
  };

  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  const handleUserChange = (e) => {
    const selectedUserId = e.target.value;
    setSelectedUser(selectedUserId);
  };

  /* *
   * Updates the task with its new contents.
   */
  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      description: description,
      labels: cardLabels,
      startDate: startDate,
      dueDate: dueDate,
      assignedUser: selectedUser,
    };

    // Check if the label is new
    const isNewLabel = !allLabels.some((label) =>
      cardLabels.some((l) => l.text === label.text)
    );

    // Add the new label to the list of all labels
    if (isNewLabel) {
      setAllLabels([...allLabels, ...cardLabels]);
    }

    updateTaskContents(updatedTask); // Update this tasks contents
  };

  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4 className="task-name">{task.content}</h4>
        </div>
        <div className="labels">
          <h5 className="labels-header">
            Labels
            <button className="add-labels-btn" onClick={toggleLabelOverlay}>
              +
            </button>
          </h5>
        </div>
        <div
          className="labels-list"
          style={{ display: "flex", flexWrap: "wrap" }}
        >
          {cardLabels.map((label, index) => (
            <span
              key={index}
              className="label-text"
              style={{ backgroundColor: label.color }}
            >
              {label.text}
            </span>
          ))}
        </div>
        <div className="task-dates">
          <div className="date-input">
            <label htmlFor="start-date" className="start-date-title">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="date-input">
            <label htmlFor="due-date" className="due-date-title">
              Due Date
            </label>
            <input
              type="date"
              id="due-date"
              value={dueDate}
              onChange={handleDueDateChange}
            />
          </div>
        </div>
        <h5 className="assign-user-header">Assign user to task</h5>
        <div className="assign-user">
          <img
            className="discord-logo"
            src={require("./discord.png")}
            alt="Discord Logo"
          />
          <select
            className="assign-user-menu"
            value={selectedUser}
            onChange={handleUserChange}
          >
            <option value="">Select a Discord user</option>
            {users.map((user) => (
              <option
                key={user.discordId}
                value={user.id}
                style={{ color: "white" }}
              >
                {user.global_name ? user.global_name : user.username}
              </option>
            ))}
          </select>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require("./close.png")} alt="Close" />
        </button>
        <div className="description">
          <h5 className="description-header">Description</h5>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            className="description-input"
          />
          <div className="input-button-container">
            <button className="save-description-btn" onClick={handleUpdateTask}>
              Save
            </button>
            <button
              className="cancel-description-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require("./close.png")} alt="Close" />
        </button>
        {isLabelOverlayVisible && (
          <LabelOverlay
            task={task}
            cardLabels={cardLabels}
            setCardLabels={setCardLabels}
            allLabels={allLabels}
            setAllLabels={setAllLabels}
            labelColor={labelColor}
            setLabelColor={setLabelColor}
            toggleLabelOverlay={toggleLabelOverlay} // Function to toggle the label overlay
            updateTaskContents={updateTaskContents} // Function to update the task contents
          />
        )}
      </div>
    </div>
  );
}

export default CardOverlay;
