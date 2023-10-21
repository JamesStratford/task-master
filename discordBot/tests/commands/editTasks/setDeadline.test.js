const {
  handleButtonClick,
  handleTaskSelection,
  getColumnMenu,
  execute,
} = require("../../../commands/editTasks/setDeadline.js");

const axios = require("axios");

const {
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");

jest.mock("axios");

describe("Kanban Commands", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("handleButtonClick", () => {
    it("should handle next button click and get the next column", async () => {
      axios.get
        .mockResolvedValueOnce({ data: { count: 3 } }) // mock totalColumnsResponse
        .mockResolvedValueOnce({ data: { title: "Test Column" } }) // mock columnResponse
        .mockResolvedValueOnce({ data: { taskIds: ["1", "2", "3"] } }); // mock taskIdsResponse
      axios.post.mockResolvedValueOnce({
        data: [
          { taskId: "1", content: "Test Task" },
          { taskId: "2", content: "Test Task 2" },
          { taskId: "3", content: "Test Task 3" },
        ],
      }); // mock tasksResponse

      const interaction = {
        customId: "next_column",
        update: jest.fn(),
      };

      await handleButtonClick(interaction);
      expect(interaction.update).toHaveBeenCalled();
    });
    it("should handle previous button click and get the previous column", async () => {
      axios.get
        .mockResolvedValueOnce({ data: { count: 3 } }) // mock totalColumnsResponse
        .mockResolvedValueOnce({ data: { title: "Test Column" } }) // mock columnResponse
        .mockResolvedValueOnce({ data: { taskIds: ["1", "2", "3"] } }); // mock taskIdsResponse
      axios.post.mockResolvedValueOnce({
        data: [
          { taskId: "1", content: "Test Task" },
          { taskId: "2", content: "Test Task 2" },
          { taskId: "3", content: "Test Task 3" },
        ],
      }); // mock tasksResponse

      const interaction = {
        customId: "next_column",
        update: jest.fn(),
      };

      await handleButtonClick(interaction);

      axios.get
        .mockResolvedValueOnce({ data: { count: 3 } }) // mock totalColumnsResponse
        .mockResolvedValueOnce({ data: { title: "Test Column" } }) // mock columnResponse
        .mockResolvedValueOnce({ data: { taskIds: ["1", "2", "3"] } }); // mock taskIdsResponse
      axios.post.mockResolvedValueOnce({
        data: [
          { taskId: "1", content: "Test Task" },
          { taskId: "2", content: "Test Task 2" },
          { taskId: "3", content: "Test Task 3" },
        ],
      }); // mock tasksResponse

      const interaction2 = {
        customId: "prev_column",
        update: jest.fn(),
      };

      await handleButtonClick(interaction2);
      expect(interaction2.update).toHaveBeenCalled();
    });
  });

  describe("getColumnMenu", () => {
    it("should get column menu with tasks", async () => {
      axios.get.mockResolvedValueOnce({ data: { taskIds: ["1", "2", "3"] } }); // mock taskIdsResponse

      axios.post.mockResolvedValueOnce({
        data: [
          { taskId: "1", content: "Test Task" },
          { taskId: "2", content: "Test Task 2" },
          { taskId: "3", content: "Test Task 3" },
        ],
      }); // mock tasksResponse

      const menu = await getColumnMenu();
      expect(menu).toBeInstanceOf(ActionRowBuilder);
    });
  });

  describe("handleTaskSelection", () => {
    it("should handle task selection and ask for due date then display success message", async () => {
      axios.post.mockResolvedValueOnce({
        data: [{ taskId: 1, content: "Test Task" }],
      });

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        channel: {
          createMessageCollector: jest.fn().mockReturnValue({
            on: jest.fn((event, cb) => {
              if (event === "collect") {
                cb({ content: "2022-01-01", delete: jest.fn() });
              }
            }),
          }),
        },
        user: { id: "1234" },
      };

      const successEmbed = new EmbedBuilder()
        .setTitle("Deadline Set")
        .setDescription("Your task: **Test Task** has been assigned the due date: **2022-01-01**")
        .setColor("Green");

      await handleTaskSelection(interaction, "1");
      expect(interaction.editReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalledWith({
        embeds: [successEmbed],
      });
    });
    it("should handle task selection and ask for due date and handle invalid date", async () => {
      axios.post.mockResolvedValueOnce({
        data: [{ taskId: 1, content: "Test Task" }],
      });

      const interaction = {
        deferReply: jest.fn(),
        message: { delete: jest.fn() },
        editReply: jest.fn(),
        channel: {
          createMessageCollector: jest.fn().mockReturnValue({
            on: jest.fn((event, cb) => {
              if (event === "collect") {
                cb({ content: "2022-31-01", delete: jest.fn() });
              }
            }),
          }),
        },
        user: { id: "1234" },
      };

      const invalidDateEmbed = new EmbedBuilder()
        .setTitle("Invalid Date Format")
        .setDescription("Please use the format YYYY-MM-DD")
        .setColor("Red");

      await handleTaskSelection(interaction, "1");
      expect(interaction.editReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalledWith({
        embeds: [invalidDateEmbed],
        ephemeral: true,
      });
    });
  });

  describe("execute", () => {
    it("should send initial embed and components", async () => {
      axios.get
        .mockResolvedValueOnce({ data: { count: 3 } }) // mock totalColumnsResponse
        .mockResolvedValueOnce({ data: { title: "Test Column" } }) // mock columnResponse
        .mockResolvedValueOnce({ data: { taskIds: ["1", "2", "3"] } }); // mock taskIdsResponse
      axios.post.mockResolvedValueOnce({
        data: [
          { taskId: "1", content: "Test Task" },
          { taskId: "2", content: "Test Task 2" },
          { taskId: "3", content: "Test Task 3" },
        ],
      }); // mock tasksResponse

      const interaction = {
        deferReply: jest.fn(),
        editReply: jest.fn(),
        user: { id: "1234" },
      };

      await execute(interaction);
      expect(interaction.editReply).toHaveBeenCalled();
    });
  });

  // Additional tests can be added as needed for other scenarios and edge cases.
});
