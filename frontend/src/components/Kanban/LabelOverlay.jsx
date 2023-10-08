import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({
  labels,
  cardLabels,
  setCardLabels,
  updateLabels,
  allLabels,
  setAllLabels,
  toggleLabelOverlay,
  fetchAllLabels,
  handleUpdateTask,
}) {
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#FF0000");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to manage editing overlay visibility
  const [editingLabel, setEditingLabel] = useState({
    // State to manage the label being edited
    text: "",
    color: "#ffffff",
  });

  const closeLabelOverlay = () => {
    toggleLabelOverlay();
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const toggleLabelInput = () => {
    setIsColorPickerVisible(false);
    setNewLabelText("");
  };

  /* *
   * Creates a new label.
   * This label is then added to the database as well as the current card.
   */
  const createNewLabel = async () => {
    // Check if the label text or color is empty
    if (!newLabelText.trim() || !newLabelColor) {
      return;
    }

    // Check if the label text already exists, ignoring whitespace
    if (allLabels.some((label) => label.text === newLabelText.trim())) {
      console.error("Label with the same text already exists");
      return;
    }

    try {
      const newLabelObject = {
        labelId: Date.now(),
        text: newLabelText.trim(),
        color: newLabelColor,
      };

      // Save the new label object to the database
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
        newLabelObject
      );

      setCardLabels([...cardLabels, newLabelObject]);
      handleUpdateTask();
    } catch (error) {
      console.error("Failed to create label:", error);

      if (error.response) {
        console.error("Response Data:", error.response.data);
      }
    }

    toggleLabelInput();
  };

  /* *
   * Deletes a label from the database and updates the allLabels state using the setAllLabels prop.
   */
  const handleDeleteLabel = async () => {
    try {
      // Delete the label from the database
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-label`,
        {
          data: { labelId: editingLabel.labelId },
        }
      );

      // Update allLabels list minus the deleted label
      setAllLabels((prevLabels) =>
        prevLabels.filter((label) => label !== editingLabel.labelId)
      );

      handleUpdateTask();

      setIsEditing(false); // Close the editing overlay
    } catch (error) {
      console.error("Failed to delete label:", error);
    }
  };

  /**
   * Opens the editing overlay and keeps track of the current label being edited and its data.
   * @param {Object} label - The current label being edited
   */
  const updateEditingLabel = (label, index) => {
    setIsEditing(true); // Open the editing overlay
    setEditingLabel({
      label,
      index,
      labelId: label.labelId,
      text: label.text,
      color: label.color,
    });

    console.log("Editing label:", label);
  };

  /* *
   * Saves the edited label and updates the labels state.
   * Also updates the allLabels state using the setAllLabels prop.
   */
  const handleSaveEditedLabel = async () => {
    try {
      const { labelId, text, color } = editingLabel; // Get the label currently being edited

      // Check if a label with the same ID exists in cardLabels
      const existingLabelIndex = cardLabels.findIndex(
        (label) => label.labelId === labelId
      );

      if (existingLabelIndex !== -1) {
        // Update the text and color of the existing label
        const updatedCardLabels = [...cardLabels];
        updatedCardLabels[existingLabelIndex].text = text;
        updatedCardLabels[existingLabelIndex].color = color;

        //fetchAllLabels();
        //setCardLabels(updatedCardLabels); // Update the list of labels in the current card overlay
      }

      // Update allLabels with the edited label using the setAllLabels prop
      setAllLabels((prevAllLabels) =>
        prevAllLabels.map((oldLabel) =>
          oldLabel.labelId === labelId ? { ...oldLabel, text, color } : oldLabel
        )
      );

      // Save the edited label to the database
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-label`,
        { labelId, text, color }
      );
      handleUpdateTask();
      setIsEditing(false); // Close the editing overlay
    } catch (error) {
      console.error("Failed to save edited label:", error);
    }
  };

  /* *
   * Allows for a user to check/uncheck a label to add/remove it from the card.
   * @param {Object} label - The label that was checked/unchecked
   */
  const handleCheckboxChange = (label) => {
    // Check if the label is already added to the card
    const isLabelSelected = cardLabels.some(
      (assignedLabel) => assignedLabel.labelId === label.labelId
    );

    // Create a copy of cardLabels
    let updatedCardLabels = [...cardLabels];

    if (isLabelSelected) {
      // If the label is already selected, unselect it and remove it from the card
      updatedCardLabels = updatedCardLabels.filter(
        (assignedLabel) => assignedLabel.labelId !== label.labelId
      );
    } else {
      // If the label is not selected, select it and add it to the card
      updatedCardLabels.push(label);
    }

    // Update the list of labels in the current card overlay
    setCardLabels(updatedCardLabels);
    handleUpdateTask();
  };

  return (
    <div className="label-overlay">
      <div className="label-overlay-header">
        <div className="label-list">
          <h1 className="label-overlay-header">Labels</h1>
          {/* List of the labels in label overlay */}
          {allLabels.map((label, index) => (
            <div key={label._id} className="select-label-checkbox-container">
              <input
                type="checkbox"
                className="select-label-checkbox"
                value={label.text}
                checked={cardLabels.some(
                  (assignedLabel) => assignedLabel.labelId === label.labelId
                )}
                onChange={() => handleCheckboxChange(label)}
              />
              <span
                className="select-label-text"
                style={{
                  backgroundColor:
                    editingLabel.labelId === label.labelId
                      ? editingLabel.color
                      : label.color,
                }}
              >
                {editingLabel.labelId === label.labelId
                  ? editingLabel.text
                  : label.text}
              </span>
              <button
                onClick={() => updateEditingLabel(label, index)}
                className="edit-label-button"
              >
                <img
                  src={require("./edit.png")}
                  alt="Edit Label"
                  style={{ width: "15px", height: "15px" }}
                />
              </button>
            </div>
          ))}
        </div>
        <h5 className="label-overlay-header">Create a label</h5>
        <div className="label-input-container">
          <input
            type="text"
            placeholder="Enter label text"
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            className="create-label-input"
          />
          <div className="create-label-container">
            <button className="change-color-btn" onClick={toggleColorPicker}>
              <img
                src={require("./pick-color.png")}
                alt="Pick Color"
                style={{ width: "20px", height: "20px" }}
              />
            </button>
            <button onClick={createNewLabel} className="create-label-btn">
              Create Label
            </button>
          </div>
        </div>
        <button onClick={closeLabelOverlay} className="close-button-overlay">
          X
        </button>
      </div>
      {isColorPickerVisible && (
        <div className="color-picker-overlay">
          <SketchPicker
            color={newLabelColor}
            onChange={(color) => setNewLabelColor(color.hex)}
            disableAlpha={true}
            presetColors={[]}
          />
        </div>
      )}
      {isEditing && (
        <div className="editing-overlay">
          <div
            className="edit-label-preview"
            style={{ backgroundColor: editingLabel.color }}
          >
            {editingLabel.text}
          </div>
          <input
            type="text"
            value={editingLabel.text}
            onChange={(e) =>
              setEditingLabel({ ...editingLabel, text: e.target.value })
            }
            className="edit-label-input"
          />
          <div className="color-picker-container">
            <SketchPicker
              color={editingLabel.color}
              onChange={(color) =>
                setEditingLabel({ ...editingLabel, color: color.hex })
              }
              disableAlpha={true}
              presetColors={[]}
            />
          </div>
          <div className="edit-label-button-container">
            <button
              onClick={handleSaveEditedLabel}
              className="save-label-button"
            >
              Save Label
            </button>
            <button onClick={handleDeleteLabel} className="delete-label-button">
              Delete Label
            </button>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="close-button-overlay"
          >
            <img src={require("./close.png")} alt="Close" />
          </button>
        </div>
      )}
    </div>
  );
}

export default LabelOverlay;
