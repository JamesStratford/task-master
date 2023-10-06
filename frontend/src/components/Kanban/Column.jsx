import React, { useState, useEffect, useCallback } from "react";

const Column = ({ column, handleUpdateColumn, provided }) => {
  const [editedColumnTitle, setEditedColumnTitle] = useState("");
  const [isEditing, setIsEditing] = useState("");
  
  useEffect(() => {
    setEditedColumnTitle(column.title); // assuming column.title is correct
  }, [column.title]);

  const handleColumnTitleDoubleClick = useCallback(() => {
    setIsEditing(column.id);
    setEditedColumnTitle(column.title);
  }, [column.id, column.title]);

  const handleEditedColumnTitleChange = useCallback((e) => {
    setEditedColumnTitle(e.target.value);
  }, []);

  const handleColumnTitleKeyPress = useCallback(async (e) => {
    if (e.key === "Enter") {
      setIsEditing("");
      handleUpdateColumn(column, editedColumnTitle);
    }
  }, [column, editedColumnTitle, handleUpdateColumn]);

  return isEditing === column.id ? (
    <input
      type="text"
      className="column-title-input"
      value={editedColumnTitle}
      onChange={handleEditedColumnTitleChange}
      onKeyPress={handleColumnTitleKeyPress}
      autoFocus
      {...provided.dragHandleProps}
    />
  ) : (
    <h3
      className="column-title"
      {...provided.dragHandleProps}
      onDoubleClick={handleColumnTitleDoubleClick}
    >
      {column.title}
    </h3>
  );
};

export default Column;