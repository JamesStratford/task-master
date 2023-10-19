const DropdownMenu = ({ isOpen, column, deleteColumn, setOpenDropdownColumnId }) => {
    const openDropdown = (columnId) => {
        setOpenDropdownColumnId(columnId);
    };

    // Function to close the dropdown menu for a column
    const closeDropdown = () => {
        setOpenDropdownColumnId(null);
    };

    return isOpen === column.id ? (
        <div className="dropdown-content">
            <button
                className="delete-column-button"
                onClick={() => deleteColumn(column.id)}
            >
                Delete Column
            </button>
            <button className="close-dropdown-button" onClick={closeDropdown}>
                Close
            </button>
        </div>
    ) : (
        <button
            className="dropdown-button"
            onClick={() => openDropdown(column.id)}
        >
            ...
        </button>
    );
};

export default DropdownMenu;