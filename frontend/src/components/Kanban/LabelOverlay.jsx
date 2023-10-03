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

  // Fetch labels data when the component mounts
  useEffect(() => {
    const fetchAllLabels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
        );

        // Merge the fetched labels with the local labels
        const mergedLabels = response.data;

        setAllLabels(mergedLabels);
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

    // Check if a label with the same text already exists
    const labelExists = allLabels.some(
      (label) => label.text === newLabel.trim()
    );

    if (labelExists) {
      // Handle the case where a label with the same text exists
      console.error("Label with the same text already exists");
      closeLabelOverlay();
      // You can display an error message or take other actions as needed
      return;
    }

    try {
      const newLabelObject = {
        text: newLabel.trim(),
        color: labelColor,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
        newLabelObject
      );

      // Assuming the server responds with the created label
      const createdLabel = response.data;

      // Update the state with the created label, including its generated "_id"
      setLabels([...labels, createdLabel]);
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
      console.log("Deleting label with ID:", selectedLabel._id); // Debugging statement

      // Make an HTTP DELETE request with the correct labelId parameter
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-label`,
        {
          data: { labelId: selectedLabel._id }, // Use selectedLabel._id
        }
      );

      // After successful deletion, update the label list by filtering out the deleted label
      setAllLabels((prevLabels) =>
        prevLabels.filter((label) => label._id !== selectedLabel._id)
      );

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
    // Check if the label exists in the system before adding it to a card
    if (allLabels.some((systemLabel) => systemLabel.text === label.text)) {
      if (!labels.some((assignedLabel) => assignedLabel.text === label.text)) {
        setLabels([...labels, label]);
      }
    }
  };

  const removeLabelFromCard = (label) => {
    // Remove the label from the card only if it exists in the system
    if (allLabels.some((systemLabel) => systemLabel.text === label.text)) {
      setLabels(
        labels.filter((assignedLabel) => assignedLabel.text !== label.text)
      );
    }
  };

  const handleEditLabel = (label) => {
    setIsEditing(!isEditing);
    setSelectedLabel(label);
    setEditedLabel({ text: label.text, color: label.color });
  };

  const handleSaveEditedLabel = async () => {
    try {
      const updatedLabel = {
        _id: selectedLabel._id, // Assuming selectedLabel._id is the label's ID
        text: editedLabel.text, // Use the text from editedLabel state
        color: editedLabel.color, // Use the color from editedLabel state
      };
  
      // Update the label in the local state without making an API call
      const updatedLabels = labels.map((l) =>
        l._id === selectedLabel._id ? { ...l, ...updatedLabel } : l
      );
  
      // Update both labels and allLabels
      setLabels(updatedLabels);
  
      setAllLabels((prevAllLabels) => {
        return prevAllLabels.map((label) =>
          label._id === selectedLabel._id ? { ...label, ...updatedLabel } : label
        );
      });
  
      setIsEditing(false);
  
      // Make an API request to update the label in the database
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-label`,
        updatedLabel
      );
  
      // Rest of the code...
    } catch (error) {
      console.error("Failed to save edited label:", error);
    }
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
            <div key={label._id} className="select-label-checkbox-container">
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
                style={{
                  backgroundColor:
                    editedLabel.text === label.text
                      ? editedLabel.color
                      : label.color,
                  // Add additional styling as needed
                }}
              >
                {editedLabel.text === label.text
                  ? editedLabel.text
                  : label.text}
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
