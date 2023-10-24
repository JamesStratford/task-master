import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CardOverlay from "../components/Kanban/CardOverlay";

const sampleUsers = [
  { id: "user1", discordId: "discordUser1" },
  { id: "user2", discordId: "discordUser2" },
  // Add more sample users as needed
];

describe("CardOverlay Component", () => {
  it("should update the assigned user when the 'Assign User' button is clicked", () => {
    const task = {
      // Provide a task with initial user assignment
      assignedUser: "initialUser",
    };

    const updateTaskContents = jest.fn();

    render(
      <CardOverlay
        task={task}
        onClose={() => {}}
        updateTaskContents={updateTaskContents}
        allLabels={[]}
        setAllLabels={() => {}}
        fetchAllLabels={() => {}}
        users={sampleUsers}
      />
    );

    const assignUserSelect = screen.getByTestId("assign-user-select");
    fireEvent.change(assignUserSelect, { target: { value: "user1" } });

    // Verify that the 'Assign User' button click triggers the updateTaskContents function
    expect(updateTaskContents).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedUser: "user1", // The expected user ID from your sampleUsers
      })
    );
  });

  it("should unassign the user when the 'Unassign User' button is clicked", () => {
    const task = {
      assignedUser: "user2",
    };

    const updateTaskContents = jest.fn();

    render(
      <CardOverlay
        task={task}
        onClose={() => {}}
        updateTaskContents={updateTaskContents}
        allLabels={[]}
        setAllLabels={() => {}}
        fetchAllLabels={() => {}}
        users={sampleUsers}
      />
    );

    const unassignUserSelect = screen.getByTestId("assign-user-select");
    fireEvent.change(unassignUserSelect, { target: { value: "" } });

    // Verify that the 'Unassign User' button click sets assignedUser to null
    expect(updateTaskContents).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedUser: "", // Expect assignedUser to be null
      })
    );
  });
});
