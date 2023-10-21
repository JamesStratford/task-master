const getTasks = require("../../../commands/viewTasks/getTasks.js");

const axios = require("axios");
const {
  execute,
  getColumnMenu,
  handleGetTasksColumn,
  handleGetTasksSelection,
  handleGetTasksButtonEdit,
  handleGetTasksButtonDelete,
  handleGetTasksSelectName,
  handleGetTasksSelectDescription,
  handleGetTasksSelectStartDate,
  handleGetTasksSelectDueDate,
  handleGetTasksSelectAssignedUser,
  handleGetTasksSelectLabels,
  handleGetTasksModalName,
  handleGetTasksModalDescription,
  handleGetTasksModalStartDate,
} = require("../../../commands/viewTasks/getTasks.js");

jest.mock("axios"); // Mocking axios calls

describe("Kanban Commands", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
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

  describe("getColumnMenu", () => {
    it("should get column menu with tasks", async () => {
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

      const columnMenu = await getColumnMenu();
      expect(columnMenu).toBeDefined();
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

  describe("handleGetTasksSelection", () => {
    it("should handle task selection", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        client: {
          users: {
            fetch: jest.fn(() => {
              return { username: "Test User" };
            }),
          },
        },
      };

      await handleGetTasksSelection(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksButtonEdit", () => {
    it("should handle edit button click and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        client: {
          users: {
            fetch: jest.fn(() => {
              return { username: "Test User" };
            }),
          },
        },
      };

      await handleGetTasksButtonEdit(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksButtonDelete", () => {
    it("should handle delete button click and delete the task", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
      };

      await handleGetTasksButtonDelete(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectName", () => {
    it("should handle name selection and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        showModal: jest.fn(),
      };

      await handleGetTasksSelectName(interaction, "1");
      expect(interaction.showModal).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectDescription", () => {
    it("should handle description selection and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        showModal: jest.fn(),
      };

      await handleGetTasksSelectDescription(interaction, "1");
      expect(interaction.showModal).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectStartDate", () => {
    it("should handle start date selection and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        showModal: jest.fn(),
      };

      await handleGetTasksSelectStartDate(interaction, "1");
      expect(interaction.showModal).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectDueDate", () => {
    it("should handle due date selection and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        showModal: jest.fn(),
      };

      await handleGetTasksSelectDueDate(interaction, "1");
      expect(interaction.showModal).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectAssignedUser", () => {
    it("should handle assigned user selection and display the edit menu", async () => {
      const interaction = {
        message: { delete: jest.fn() },
        reply: jest.fn(),
      };

      await handleGetTasksSelectAssignedUser(interaction, "1");
      expect(interaction.reply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksSelectLabels", () => {
    it("should handle labels selection and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };
      const labelsResponse = {
        data: [
          { labelId: "1", text: "Test Label" },
          { labelId: "2", text: "Test Label 2" },
        ],
      };

      axios.get.mockResolvedValueOnce(labelsResponse);
      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
      };

      await handleGetTasksSelectLabels(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksModalName", () => {
    it("should handle name modal submission and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        fields: {
          getTextInputValue: jest.fn(() => {
            return "Test Task";
          }),
        },
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        client: {
          users: {
            fetch: jest.fn(() => {
              return { username: "Test User" };
            }),
          },
        },
      };

      axios.put = jest.fn();

      await handleGetTasksModalName(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });

    it("should handle a empty String and display an error message", async () => {
      const interaction = {
        fields: {
          getTextInputValue: jest.fn(() => {
            return "";
          }),
        },
        reply: jest.fn(),
      };

      await handleGetTasksModalName(interaction, "1");
      expect(interaction.reply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksModalDescription", () => {
    it("should handle description modal submission and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        fields: {
          getTextInputValue: jest.fn(() => {
            return "Test Task";
          }),
        },
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        client: {
          users: {
            fetch: jest.fn(() => {
              return { username: "Test User" };
            }),
          },
        },
      };

      axios.put = jest.fn();

      await handleGetTasksModalDescription(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  describe("handleGetTasksModalStartDate", () => {
    it("should handle start date modal submission and display the edit menu", async () => {
      const tasksResponse = {
        data: [
          {
            taskId: "1",
            content: "Test Task",
            startDate: "2023-10-20",
            dueDate: "2023-10-31",
            description: "test description",
            assignedUser: "1234",
            labels: ["1", "2"],
          },
        ],
      };

      axios.post.mockResolvedValueOnce(tasksResponse);

      const interaction = {
        fields: {
          getTextInputValue: jest.fn(() => {
            return "2023-10-20";
          }),
        },
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        client: {
          users: {
            fetch: jest.fn(() => {
              return { username: "Test User" };
            }),
          },
        },
      };

      axios.put = jest.fn();

      await handleGetTasksModalStartDate(interaction, "1");
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.message.delete).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });

    it("should handle a incorrect date and display an error message", async () => {
      const interaction = {
        fields: {
          getTextInputValue: jest.fn(() => {
            return "06/03/2024";
          }),
        },
        reply: jest.fn(),
      };

      await handleGetTasksModalStartDate(interaction, "1");
      expect(interaction.reply).toHaveBeenCalled();
    });
  });
});
