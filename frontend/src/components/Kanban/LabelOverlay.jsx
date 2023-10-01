    import React, { useState } from "react";
    import { SketchPicker } from "react-color";
    import axios from "axios";

    function LabelOverlay({
        labels,
        setLabels,
        toggleLabelInput,
        onClose,
    }) {
    const [newLabel, setNewLabel] = useState("");
    const [labelColor, setLabelColor] = useState("#ffffff");
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Function to toggle color picker visibility
    const toggleColorPicker = () => {
        setIsColorPickerVisible(!isColorPickerVisible);
    };

    // Function to handle creating a new label
    // Function to create a new label
    const createNewLabel = async () => {
        // Check if the newLabel is empty or contains only whitespace
        if (!newLabel.trim()) {
        console.error("Label text is required.");
        return;
        }

        console.log(
        "Making API request to:",
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`
        );

        try {
        // Create a new label object using the text from the input field and the selected color
        const newLabelObject = { text: newLabel.trim(), color: labelColor };

        // Update the task in the local state
        setLabels([...labels, newLabelObject]);

        // Update the task in the database
        await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
            {
            label: newLabelObject,
            }
        );

        // If successful, log a success message
        console.log("Label successfully created:", newLabelObject);
        } catch (error) {
        console.error("Failed to create label:", error);

        // Log the response data if available
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
        }
        toggleLabelInput();
        closeLabelOverlay();
    };

    // Function to close the LabelOverlay
    const handleClose = () => {
        setIsVisible(false);
        onClose();
    };

    // New method to close only the LabelOverlay
    const closeLabelOverlay = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="label-overlay">
        <div className="label-overlay-content">
            <h5 className="label-overlay-header">Create a label</h5>
            <div className="label-input-container">
            <input
                type="text"
                placeholder="Enter label text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="create-label-input"
            />
            <div className="create-label-container" onClick={toggleColorPicker}>
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
        </div>
    );
    }

    export default LabelOverlay;
