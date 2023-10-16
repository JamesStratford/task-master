import React, { useState } from "react";
import LabelOverlay from "./LabelOverlay";


function CardOverlay({
  task,
  onClose,
  updateTaskContents,
  allLabels,
  setAllLabels,
  // fetchAllLabels,
}) {
  const [description, setDescription] = useState(task.description || ""); // Manage the description state
  const [labelColor, setLabelColor] = useState("#ffffff"); // Manage the label color state
  const [cardLabels, setCardLabels] = useState(task.labels || []); // Manage the labels state
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false); // Manage the label overlay visibility state
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  /* Function to handle description change */
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  /* Function to cancel editing description */
  const handleCancelEdit = () => {
    setDescription(task.description || "");
  };

  /* Function to toggle the label overlay */
  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  /* *
   * Function to handle the updating of task contents.
   * */
  const handleUpdateTask = () => {
    // Data for the updated task
    const updatedTask = {
      ...task,
      description: description,
      labels: cardLabels,
    };

    // Check if the edited label is new (not in allLabels)
    const isNewLabel = !allLabels.some((label) =>
      cardLabels.some((l) => l.text === label.text)
    );

    // If it's a new label, add it to allLabels
    if (isNewLabel) {
      setAllLabels([...allLabels, ...cardLabels]);
    }

    updateTaskContents(updatedTask); // Update this tasks contents
  };

  const handleCheckItem = (index) => {
    setChecklist((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleAddItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist((prev) => [...prev, { content: newChecklistItem, isChecked: false }]);
      setNewChecklistItem("");
    }
  };

  const handleNewItemChange = (e) => {
    setNewChecklistItem(e.target.value);
  };

  const handleDeleteItem = (index) => {
    setChecklist((prev) => prev.filter((_, idx) => idx !== index));
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

        <div className="checklist">
      <h5 className="checklist-header">Checklist</h5>
      <ul>
        {checklist.map((item, index) => (
          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={() => handleCheckItem(index)}
              />
              {item.content}
            </div>
            <button onClick={() => handleDeleteItem(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newChecklistItem}
        onChange={handleNewItemChange}
        placeholder="Add new item"
      />
      <button onClick={handleAddItem}>Add</button>
    </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require("./close.png")} alt="Close" />
        </button>
        {isLabelOverlayVisible && (
          <LabelOverlay
            task={task} // The current task
            // All saved labels for the current card
            cardLabels={cardLabels}
            setCardLabels={setCardLabels}
            // All labels tha have been saved
            allLabels={allLabels}
            setAllLabels={setAllLabels}
            // Label color properties
            labelColor={labelColor}
            setLabelColor={setLabelColor}
            toggleLabelOverlay={toggleLabelOverlay} // Function to toggle the label overlay
            // fetchAllLabels={fetchAllLabels} // Function to fetch all labels
            handleUpdateTask={handleUpdateTask} // Function to handle the updating of task contents
            updateTaskContents={updateTaskContents} // Function to update the task contents
          />
        )}
      </div>
    </div>
  );
}

export default CardOverlay;
