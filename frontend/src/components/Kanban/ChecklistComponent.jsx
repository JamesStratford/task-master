import React from 'react';
import axios from 'axios';
import checklistIcon from './checklist.png';

function ChecklistComponent({ taskId, initialChecklist, onChecklistUpdate }) {
    // State variables
    const [checklist, setChecklist] = React.useState(initialChecklist || []);
    const [newChecklistItem, setNewChecklistItem] = React.useState("");
    const [isErrorVisible, setIsErrorVisible] = React.useState(false);

    const handleNewItemChange = (e) => {
        setNewChecklistItem(e.target.value);
    };

    const handleAddItem = async () => {
        if (newChecklistItem.trim()) {
            setIsErrorVisible(false); 
      
            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-checklist-item`, {
                    taskId: taskId,
                    checklistItem: {
                        description: newChecklistItem,
                        isCompleted: false
                    }
                });

                if(response.status === 200 && response.data.checklist) {
                    setChecklist(response.data.checklist);
                    setNewChecklistItem("");
                    onChecklistUpdate(response.data.checklist);
                }
            } catch(error) {
                console.error("Error adding checklist item:", error);
            }
        } else {
            setIsErrorVisible(true);
        }
    };

    const handleCheckItem = async (index) => {
        const currentItem = checklist[index];
        const updatedStatus = !currentItem.isCompleted; 
        
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-checklist-item-status`,
                {
                    taskId: taskId,
                    checklistItemId: currentItem._id,
                    isCompleted: updatedStatus
                }
            );

            if(response.status === 200 && response.data.checklist) {
                setChecklist(response.data.checklist);
                onChecklistUpdate(response.data.checklist);
            }
        } catch(error) {
            console.error("Error updating checklist item status:", error);
        }
    };

    const handleDeleteItem = async (index) => {
        const currentItem = checklist[index];
        
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-checklist-item`, {
                taskId: taskId,
                checklistItemId: currentItem._id
            });

            if(response.status === 200 && response.data.checklist) {
                setChecklist(response.data.checklist);
                onChecklistUpdate(response.data.checklist);
            }
        } catch(error) {
            console.error("Error deleting checklist item:", error);
        }
    };

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
