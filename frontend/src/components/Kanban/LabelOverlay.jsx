import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({ labels, setLabels, toggleLabelInput, onClose }) {
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [allLabels, setAllLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState({
    text: "",
    color: "#ffffff",
  });

  useEffect(() => {
    const fetchAllLabels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
        );
        setAllLabels(response.data);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchAllLabels();
  }, []);

  const createNewLabel = async () => {
    if (!newLabel.trim() || !labelColor) {
      return;
    }

    try {
      const newLabelObject = {
        text: newLabel.trim(),
        color: labelColor,
        id: Date.now(),
      };

      setLabels([...labels, newLabelObject]);

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
        newLabelObject
      );
    } catch (error) {
      console.error("Failed to create label:", error);

      if (error.response) {
        console.error("Response Data:", error.response.data);
      }
    }

    toggleLabelInput();
    closeLabelOverlay();
  };

  const handleDeleteLabel = async () => {
    try {
      console.log("Deleting label with ID:", selectedLabel.id); // Debugging statement
      // Make an HTTP DELETE request with the correct labelId parameter
      const response = await axios.delete("/api/kanban/delete-label", {
        data: { labelId: selectedLabel.id }, // Use selectedLabel._id
      });
      console.log("Delete label response:", response.data); // Log the response or handle it as needed
  
      if (response.status === 200) {
        console.log("Label deleted successfully.");
      } else {
        console.error("Label deletion failed. Status:", response.status);
      }
  
      setIsEditing(false); // Close the editing overlay
    } catch (error) {
      console.error("Failed to delete label:", error);
      // Handle the error as needed
    }
  };
  

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const addLabelToCard = (label) => {
    if (!labels.some((assignedLabel) => assignedLabel.text === label.text)) {
      setLabels([...labels, label]);
    }
  };

  const removeLabelFromCard = (label) => {
    setLabels(
      labels.filter((assignedLabel) => assignedLabel.text !== label.text)
    );
  };

  const handleEditLabel = (label) => {
    setIsEditing(!isEditing);
    setSelectedLabel(label);
    setEditedLabel({ text: label.text, color: label.color });
  };

  const handleSaveEditedLabel = () => {
    const updatedLabels = labels.map((l) =>
      l.text === selectedLabel.text
        ? { text: editedLabel.text, color: editedLabel.color }
        : l
    );

    setLabels(updatedLabels);
    setIsEditing(false);
  };

  const closeLabelOverlay = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="label-overlay">
      <div className="label-overlay-header">
        <div className="label-list">
          <h1 className="label-overlay-header">Labels</h1>
          {allLabels.map((label) => (
            <div key={label.id} className="select-label-checkbox-container">
              <input
                type="checkbox"
                className="select-label-checkbox"
                value={label.text}
                checked={labels.some(
                  (assignedLabel) => assignedLabel.text === label.text
                )}
                onChange={(e) => {
                  setSelectedLabel(label);
                  if (e.target.checked) {
                    addLabelToCard(label);
                  } else {
                    removeLabelFromCard(label);
                  }
                }}
              />
              <span
                className="select-label-text"
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </span>
              <button
                onClick={() => handleEditLabel(label)}
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
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
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
            color={labelColor}
            onChange={(color) => setLabelColor(color.hex)}
            disableAlpha={true}
            presetColors={[]}
          />
        </div>
      )}
      {isEditing && (
        <div className="editing-overlay">
          <div
            className="edit-label-preview"
            style={{ backgroundColor: editedLabel.color }}
          >
            {editedLabel.text}
          </div>
          <input
            type="text"
            value={editedLabel.text}
            onChange={(e) =>
              setEditedLabel({ ...editedLabel, text: e.target.value })
            }
            className="edit-label-input"
          />
          <div className="color-picker-container">
            <SketchPicker
              color={editedLabel.color}
              onChange={(color) =>
                setEditedLabel({ ...editedLabel, color: color.hex })
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
