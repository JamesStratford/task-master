import React from 'react';
import axios from 'axios';
import checklistIcon from './checklist.png';

function ChecklistComponent({ taskId, initialChecklist, onChecklistUpdate }) {
    // State variables
    const [checklist, setChecklist] = React.useState(initialChecklist || []);
    const [newChecklistItem, setNewChecklistItem] = React.useState("");
    const [isErrorVisible, setIsErrorVisible] = React.useState(false);

    /**
     * Adds a new item to the checklist after validating the input.
     */
    const handleAddItem = async () => {
        // Check if the new checklist item input is not empty
        if (newChecklistItem.trim()) {
            setIsErrorVisible(false); 
      
            try {
                // Post request to add a new checklist item
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-checklist-item`, {
                    taskId: taskId,
                    checklistItem: {
                        description: newChecklistItem,
                        isCompleted: false
                    }
                });

                // If the response is successful, update the local checklist and clear the input field
                if(response.status === 200) {
                    const updatedChecklist = [...checklist, { description: newChecklistItem, isCompleted: false }];
                    setChecklist(updatedChecklist);
                    setNewChecklistItem("");
                    onChecklistUpdate(updatedChecklist); // Notify parent of the change
                }
            } catch(error) {
                console.error("Error adding checklist item:", error);
            }
        } else {
            // Display an error if the input is empty
            setIsErrorVisible(true);
        }
    };

    /**
     * Toggles the completion status of a checklist item.
     * @param {number} index - The index of the item in the checklist array
     */
    const handleCheckItem = async (index) => {
        const currentItem = checklist[index];
        const updatedStatus = !currentItem.isCompleted; 
      
        try {
            // Post request to update the status of a checklist item
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-checklist-item-status`,
                {
                    taskId: taskId,
                    checklistItemId: currentItem._id,
                    isCompleted: updatedStatus
                }
            );

            // If the response is successful, update the local checklist
            if(response.status === 200) {
                const updatedChecklist = checklist.map((item, idx) => {
                    if (idx === index) {
                        return { ...item, isCompleted: updatedStatus };
                    }
                    return item;
                });
                setChecklist(updatedChecklist);
                onChecklistUpdate(updatedChecklist); // Notify parent of the change
            }
        } catch(error) {
            console.error("Error updating checklist item status:", error);
        }
    };

    /**
     * Handles changes to the new checklist item input.
     * @param {Event} e - The input change event
     */
    const handleNewItemChange = (e) => {
        setNewChecklistItem(e.target.value);
    };

    /**
     * Deletes a checklist item.
     * @param {number} index - The index of the item in the checklist array
     */
    const handleDeleteItem = async (index) => {
        const currentItem = checklist[index];
        try {
            // Post request to delete a checklist item
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-checklist-item`, {
                taskId: taskId,
                checklistItemId: currentItem._id
            });

            // If the response is successful, update the local checklist
            if(response.status === 200) {
                const updatedChecklist = checklist.filter((_, idx) => idx !== index);
                setChecklist(updatedChecklist);
                onChecklistUpdate(updatedChecklist); // Notify parent of the change
            }
        } catch(error) {
            console.error("Error deleting checklist item:", error);
        }
    };

    // Render the checklist component
    return (
        <div className="checklist">
            <h5 className="checklist-header">
                <img src={checklistIcon} alt="Checklist Icon" className="checklist-icon" /> 
                Checklist
            </h5>
            <ul className="checklist-items">
                {checklist.map((item, index) => (
                    <li key={index} className="checklist-item">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                className="checklist-item-checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleCheckItem(index)}
                            />
                            <span className={item.isCompleted ? "checklist-item-text completed" : "checklist-item-text"}>
                                {item.description}
                            </span>
                        </div>
                        <button className="delete-checklist-item-btn" onClick={() => handleDeleteItem(index)}>Delete</button>
                    </li>
                ))}
            </ul>
            {isErrorVisible && <div className="error-message">Please enter a valid checklist item.</div>}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    className="new-checklist-item-input"
                    value={newChecklistItem}
                    onChange={handleNewItemChange}
                    placeholder="Add new item"
                />
                <button className="add-checklist-item-btn" onClick={handleAddItem}>Add</button>
            </div>
        </div>
    );
}

export default ChecklistComponent;
