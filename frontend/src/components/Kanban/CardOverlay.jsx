import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";
import LabelOverlay from "./LabelOverlay";

function CardOverlay({
  task,
  onClose,
  updateTaskContents,
  allLabels,
  setAllLabels,
  fetchAllLabels,
}) {
  const [description, setDescription] = useState(task.description || "");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [cardLabels, setCardLabels] = useState(task.labels || []);
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false);
  const [startDate, setStartDate] = useState(task.startDate);
  const [dueDate, setDueDate] = useState(task.dueDate);

  useEffect(() => {
    handleUpdateTask();
  }, [startDate, dueDate]);

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

  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      description: description,
      labels: cardLabels,
      startDate: startDate,
      dueDate: dueDate,
    };

    const isNewLabel = !allLabels.some((label) =>
      cardLabels.some((l) => l.text === label.text)
    );

    if (isNewLabel) {
      setAllLabels([...allLabels, ...cardLabels]);
    }

    fetchAllLabels();
    updateTaskContents(updatedTask);
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
            toggleLabelOverlay={toggleLabelOverlay}
            fetchAllLabels={fetchAllLabels}
            handleUpdateTask={handleUpdateTask}
            updateTaskContents={updateTaskContents}
          />
        )}
      </div>
    </div>
  );
}

export default CardOverlay;
