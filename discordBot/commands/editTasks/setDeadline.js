const {
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");
require("dotenv").config({ path: "frontend/.env" });

// Data to export

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-deadline")
    .setDescription("Sets the deadline for a task"),

  execute: execute,
  handleButtonClick: handleButtonClick,
  handleTaskSelection: handleTaskSelection,
  getColumnMenu: getColumnMenu,
};

// Create Next and Previous Buttons

const nextButton = new ButtonBuilder()
  .setCustomId("next_column")
  .setLabel("Next")
  .setStyle(ButtonStyle.Primary);

const prevButton = new ButtonBuilder()
  .setCustomId("prev_column")
  .setLabel("Previous")
  .setStyle(ButtonStyle.Secondary);

let currentColumnIndex = 0;

async function handleButtonClick(interaction) {
  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  if (
    interaction.customId === "next_column" &&
    currentColumnIndex < totalColumns - 1
  ) {
    currentColumnIndex++;
  } else if (interaction.customId === "prev_column" && currentColumnIndex > 0) {
    currentColumnIndex--;
  }

  const columnResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
  );

  const column = columnResponse.data;

  const selectMenu = await getColumnMenu(currentColumnIndex);

  nextButton.setDisabled(currentColumnIndex >= totalColumns - 1);
  prevButton.setDisabled(currentColumnIndex <= 0);

  const columnMenuEmbed = new EmbedBuilder()
    .setTitle("Select a Task to Set a Deadline For")
    .setDescription(`Select a task from: **${column.title}**`)
    .setColor("Blue");

  await interaction.update({
    embeds: [columnMenuEmbed],
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
  });
}

async function handleTaskSelection(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const selectedTask = tasksResponse.data[0];

  const taskEmbed = new EmbedBuilder()
    .setTitle("Set a Deadline for Your Task")
    .setDescription(
      `You selected task: **${selectedTask.content}**, please reply with a due date in the format YYYY-MM-DD.`
    )
    .setColor("Blue");

  await interaction.editReply({
    embeds: [taskEmbed],
  });

  // Ask user for due date

  const filter = (Response) => Response.author.id === interaction.user.id;

  const collector = interaction.channel.createMessageCollector({
    filter,
    max: 1,
    time: 60000,
  });

  collector.on("collect", async (Response) => {
    const dueDate = Response.content;

    await Response.delete();

    // Check if due date is valid

    const dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    if (!dateFormatRegex.test(dueDate)) {
      const invalidDateEmbed = new EmbedBuilder()
        .setTitle("Invalid Date Format")
        .setDescription("Please use the format YYYY-MM-DD")
        .setColor("Red");

      await interaction.editReply({
        embeds: [invalidDateEmbed],
        ephemeral: true,
      });
      return;
    }

    // Set deadline to task in web server

    try {
      axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
        newTask: {
          taskId: selectedTask.taskId,
          dueDate: dueDate,
        },
      });

      const successEmbed = new EmbedBuilder()
        .setTitle("Deadline Set")
        .setDescription(
          `Your task: **${selectedTask.content}** has been assigned the due date: **${dueDate}**`
        )
        .setColor("Green");

      await interaction.editReply({
        embeds: [successEmbed],
      });
    } catch (error) {
      console.error("Error fetching tasks: ", error.message);

      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Sorry, something went wrong while updating your task.")
        .setColor("Red");

      await interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  });
}

async function getColumnMenu() {
  try {
    // Get the column by index
    const columnResponse = await axios.get(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
    );

    const column = columnResponse.data;

    if (!column) {
      throw new Error(`Column not found for index: ${currentColumnIndex}`);
    }

    // Fetch tasks based on taskIds in the column
    const tasksResponse = await axios.post(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
      {
        taskIds: column.taskIds,
      }
    );

    const tasks = tasksResponse.data;

    if (tasks.length === 0) {
      const taskSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("task_select")
        .setPlaceholder("No tasks")
        .addOptions({ label: "No tasks", value: "no_tasks" })
        .setDisabled(true);

      return new ActionRowBuilder().addComponents(taskSelectMenu);
    }

    // Convert tasks to select menu options
    const taskOptions = tasks.map((task) => {
      if (!task.content || task.content.trim() === "") {
        // Provide a default label if task content is empty
        return {
          label: "No Content",
          value: task.taskId,
        };
      }
      return {
        label: task.content.substring(0, 25),
        value: task.taskId,
      };
    });

    console.log(taskOptions);

    // Construct the select menu
    const taskSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("task_select")
      .setPlaceholder("Select a task")
      .addOptions(taskOptions);

    const taskSelectMenuComponent = new ActionRowBuilder().addComponents(
      taskSelectMenu
    );

    return taskSelectMenuComponent;
  } catch (error) {
    console.error(`Error in getColumnMenu: ${error.message}`);
    throw error;
  }
}

async function execute(interaction) {
  await interaction.deferReply();

  const userId = interaction.user.id;

  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  // Get the first column menu (you can adjust the index as needed)
  const selectMenu = await getColumnMenu(currentColumnIndex);

  const columnResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
  );

  const column = columnResponse.data;

  nextButton.setDisabled(currentColumnIndex >= totalColumns - 1);
  prevButton.setDisabled(currentColumnIndex <= 0);

  const columnMenuEmbed = new EmbedBuilder()
    .setTitle("Select a Task to Set a Deadline For")
    .setDescription(`Select a task from: **${column.title}**`)
    .setColor("Blue");

  await interaction.editReply({
    embeds: [columnMenuEmbed],
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
  });
}
