const axios = require("axios");
const {
  execute,
  handleGetTasksColumn,
} = require("../../../commands/viewTasks/getTasks.js");

jest.mock("axios"); // Mocking axios calls

describe("execute", () => {
  it("should display the initial menu", async () => {
    const totalColumnsResponse = { data: { count: 5 } };
    const columnResponse = { data: { title: "Sample Column" } };
    const taskIdsResponse = { data: { taskIds: ["1", "2", "3"] } };
    const tasksResponse = {
      data: [
        { taskId: "1", content: "Test Task" },
        { taskId: "2", content: "Test Task 2" },
        { taskId: "3", content: "Test Task 3" },
      ],
    };

    axios.get
      .mockResolvedValueOnce(totalColumnsResponse)
      .mockResolvedValueOnce(columnResponse)
      .mockResolvedValueOnce(taskIdsResponse);
    axios.post.mockResolvedValueOnce(tasksResponse);

    const interaction = {
      deferReply: jest.fn(),
      editReply: jest.fn(),
      user: { id: "1234" },
    };

    await execute(interaction);
    expect(interaction.editReply).toHaveBeenCalled();
  });
});

describe("handleGetTasksColumn", () => {
  it("should handle next button click and get the next column", async () => {
    const totalColumnsResponse = { data: { count: 5 } };
    const columnResponse = { data: { title: "Sample Column" } };
    const taskIdsResponse = { data: { taskIds: ["1", "2", "3"] } };
    const tasksResponse = {
      data: [
        { taskId: "1", content: "Test Task" },
        { taskId: "2", content: "Test Task 2" },
        { taskId: "3", content: "Test Task 3" },
      ],
    };

    axios.get
      .mockResolvedValueOnce(totalColumnsResponse)
      .mockResolvedValueOnce(columnResponse)
      .mockResolvedValueOnce(taskIdsResponse);
    axios.post.mockResolvedValueOnce(tasksResponse);

    const interaction = {
      customId: "next_column",
      update: jest.fn(),
    };

    await handleGetTasksColumn(interaction);
    expect(interaction.update).toHaveBeenCalled();
  });
  it("should handle previous button click and get the previous column", async () => {
    const totalColumnsResponse = { data: { count: 5 } };
    const columnResponse = { data: { title: "Sample Column" } };
    const taskIdsResponse = { data: { taskIds: ["1", "2", "3"] } };
    const tasksResponse = {
      data: [
        { taskId: "1", content: "Test Task" },
        { taskId: "2", content: "Test Task 2" },
        { taskId: "3", content: "Test Task 3" },
      ],
    };

    axios.get
      .mockResolvedValueOnce(totalColumnsResponse)
      .mockResolvedValueOnce(columnResponse)
      .mockResolvedValueOnce(taskIdsResponse);
    axios.post.mockResolvedValueOnce(tasksResponse);

    const interaction = {
      customId: "next_column",
      update: jest.fn(),
    };

    await handleGetTasksColumn(interaction);
    expect(interaction.update).toHaveBeenCalled();
  });
});
