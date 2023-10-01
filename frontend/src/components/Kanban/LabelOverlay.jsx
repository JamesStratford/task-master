    import React, { useState, useEffect } from "react";
    import { SketchPicker } from "react-color";
    import axios from "axios";

    function LabelOverlay({ labels, setLabels, toggleLabelInput, onClose }) {
    const [newLabel, setNewLabel] = useState("");
    const [labelColor, setLabelColor] = useState("#ffffff");
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [allLabels, setAllLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(""); // State to store the selected label from the dropdown
    const [selectedLabels, setSelectedLabels] = useState([]); // State to store selected labels for the current card

    useEffect(() => {
        // Fetch all labels from the database when the component mounts
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

    // Function to toggle color picker visibility
    const toggleColorPicker = () => {
        setIsColorPickerVisible(!isColorPickerVisible);
    };

    const handleAddLabelToCard = () => {
        // Check if a label is selected
        if (selectedLabel) {
        // Find the selected label in the allLabels array
        const labelToAdd = allLabels.find((label) => label.text === selectedLabel);

        if (labelToAdd) {
            // Check if the label is not already in the current card's labels
            const isLabelAlreadyAssigned = labels.some(
            (label) => label.text === labelToAdd.text
            );

            if (!isLabelAlreadyAssigned) {
            // Add the label to the current card's labels
            setLabels([...labels, labelToAdd]);
            } else {
            // Label is already assigned to the card, show an error or handle as needed
            console.error("Label is already assigned to the card.");
            }
        }
        }
        closeLabelOverlay();
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
        <div className="label-overlay-header">
            <div className="label-list">
            <h5 className="label-overlay-header">Labels</h5>
            {allLabels.map((label) => (
                <label key={label.id} className="select-label-item">
                <input
                    type="checkbox"
                    value={label.text}
                    checked={selectedLabels.includes(label.text)}
                    onChange={(e) => {
                    const selectedLabel = e.target.value;
                    setSelectedLabels((prevSelectedLabels) =>
                        prevSelectedLabels.includes(selectedLabel)
                        ? prevSelectedLabels.filter((l) => l !== selectedLabel)
                        : [...prevSelectedLabels, selectedLabel]
                    );
                    }}
                />
                <span
                    className="select-label-text"
                    style={{ backgroundColor: label.color }}
                >
                    {label.text}
                </span>
                </label>
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
        </div>
    );
    }

    export default LabelOverlay;
