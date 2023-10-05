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

  useEffect(() => {
    fetchAllLabels();
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
   * Fetches all labels from the database and updates the allLabels state using the setAllLabels prop.
   */
  const fetchAllLabels = async () => {
    try {
      // Fetch all labels from the database
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
      );

      // Update the allLabels with the updated label list
      const updatedLabelList = response.data;
      setAllLabels(updatedLabelList);
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    }
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

      fetchAllLabels(); // Updates label overlay with the new label list
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

      setIsEditing(false); // Close the editing overlay
    } catch (error) {
      console.error("Failed to delete label:", error);
    }
  };

  /**
   * Opens the editing overlay and keeps track of the current label being edited and its data.
   * @param {Object} label - The current label being edited
   */
  const updateEditingLabel = (label) => {
    setIsEditing(true); // Open the editing overlay
    setEditingLabel({
      label,
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
      const { label, text, color } = editingLabel; // Get the label currently being edited

      // The updated version of the label currently being edited
      const updatedLabel = {
        labelId: label.labelId, // Keep same ID
        text,
        color,
      };

      // Search through all labels and update the label with the matching ID with new text/color
      const updatedCardLabels = cardLabels.map((oldLabel) =>
        oldLabel.labelId === label.labelId ? updatedLabel : oldLabel
      );

      setCardLabels(updatedCardLabels); // Updates the list of labels in the current card overlay

      // Update allLabels with the edited label using the setAllLabels prop
      setAllLabels((prevAllLabels) =>
        prevAllLabels.map((oldLabel) =>
          oldLabel.labelId === label.labelId
            ? { ...oldLabel, ...updatedLabel }
            : oldLabel
        )
      );

      // Save the edited label to the database
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-label`,
        updatedLabel
      );

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
    // If the label is already added to the card, uncheck the label and remove it from the card
    if (cardLabels.some((assignedLabel) => assignedLabel._id === label._id)) {
      setCardLabels(
        cardLabels.filter((assignedLabel) => assignedLabel._id !== label._id)
      );
    } else {
      // If the label is not already added to the card, check the label and add it to the card
      setCardLabels([...cardLabels, label]);
    }
  };

  return (
    <div className="label-overlay">
      <div className="label-overlay-header">
        <div className="label-list">
          <h1 className="label-overlay-header">Labels</h1>
          {/* List of the labels in label overlay */}
          {allLabels.map((label) => (
            <div key={label._id} className="select-label-checkbox-container">
              <input
                type="checkbox"
                className="select-label-checkbox"
                value={label.text}
                checked={cardLabels.some(
                  (assignedLabel) => assignedLabel._id === label._id
                )}
                onChange={() => handleCheckboxChange(label)}
              />
              <span
                className="select-label-text"
                style={{
                  backgroundColor:
                    editingLabel._id === label._id
                      ? editingLabel.color
                      : label.color,
                }}
              >
                {editingLabel._id === label._id
                  ? editingLabel.text
                  : label.text}
              </span>
              <button
                onClick={() => updateEditingLabel(label)}
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
