import React, { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

function Column(props) {
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [newCardContent, setNewCardContent] = useState("");

  const toggleAddCardForm = () => {
    setShowAddCardForm(!showAddCardForm);
  };

  const handleAddCard = () => {
    // Create a new card with the provided content and add it to the column
    const newCard = {
      id: 1,
      content: newCardContent,
    };

    // Update the state with the new card
    props.addCardToColumn(props.column.id, newCard);

    // Reset the form and hide it
    setNewCardContent("");
    setShowAddCardForm(false);
  };

  return (
    <Draggable draggableId={this.props.column.id} index={this.props.index}>
      {(provided) => (
        <div className="column-container">
          {...provided.draggableProps}
          innerRef={provided.innerRef}
          <h3 {...provided.dragHandleProps} className="column-title">{props.column.title}</h3>
          <Droppable droppableId={props.column.id} type="task">
            {(provided) => (
              <div
                className="task-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {showAddCardForm ? (
                  <div className="add-card-form">
                    <textarea
                      value={newCardContent}
                      onChange={(e) => setNewCardContent(e.target.value)}
                      placeholder="Enter card content"
                    />
                    <button onClick={handleAddCard}>Add a card</button>
                  </div>
                ) : (
                  <button onClick={toggleAddCardForm}>Add a card</button>
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
