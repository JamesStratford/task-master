import React, { useState } from "react";

const AddColumnButton = ({ addColumn }) => {
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddColumn = () => {
      if (newColumnTitle.trim() === "") {
        // Don't add an empty column
        console.log("Empty column");
        return;
      }

      // Call the addColumn function with the title
      addColumn(newColumnTitle);

      // Clear the input field and reset the state
      setNewColumnTitle("");
      setIsAdding(false);
    };

    return (
      <div className="add-column-container">
        {isAdding ? (
          <div>
            <input
              type="text"
              placeholder="Enter column title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />
            <button onClick={handleAddColumn}>Add Column</button>
          </div>
        ) : (
          <button className="add-column-button" onClick={() => setIsAdding(true)}>
            + Add Column
          </button>
        )}
      </div>
    );
  };

  export default AddColumnButton;