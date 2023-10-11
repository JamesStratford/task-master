import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CardOverlay from "../components/Kanban/CardOverlay";

describe("CardOverlay Component", () => {
  it("renders the CardOverlay component", () => {
    const { container } = render(
      <CardOverlay
        task={{}}
        onClose={() => {}}
        updateTaskContents={() => {}}
        allLabels={[]}
        setAllLabels={() => {}}
        fetchAllLabels={() => {}}
      />
    );
    expect(container).toBeTruthy();
  });

  it("displays the start date and due date", () => {
    const task = {
      // Provide a task with start and due date
      startDate: "2023-01-01",
      dueDate: "2023-01-10",
    };

    render(
      <CardOverlay
        task={task}
        onClose={() => {}}
        updateTaskContents={() => {}}
        allLabels={[]}
        setAllLabels={() => {}}
        fetchAllLabels={() => {}}
      />
    );

    const startDateInput = screen.getByLabelText("Start Date");
    const dueDateInput = screen.getByLabelText("Due Date");

    expect(startDateInput.value).toBe("2023-01-01");
    expect(dueDateInput.value).toBe("2023-01-10");
  });

  it("edits the start and due dates", () => {
    const task = {
      startDate: "2023-01-01",
      dueDate: "2023-01-10",
    };
  
    const updateTaskContents = jest.fn();
  
    render(
      <CardOverlay
        task={task}
        onClose={() => {}}
        updateTaskContents={updateTaskContents}
        allLabels={[]}
        setAllLabels={() => {}}
        fetchAllLabels={() => {}}>
        </CardOverlay>
      );
  
    const startDateInput = screen.getByLabelText("Start Date");
    const dueDateInput = screen.getByLabelText("Due Date");
    const saveButton = screen.getByText("Save");
  
    fireEvent.change(startDateInput, { target: { value: "2023-01-05" } });
    fireEvent.change(dueDateInput, { target: { value: "2023-01-15" } });
    fireEvent.click(saveButton);
  
    // Check if the values in the input boxes have been updated
    expect(startDateInput.value).toBe("2023-01-05");
    expect(dueDateInput.value).toBe("2023-01-15");
  });
  
});
