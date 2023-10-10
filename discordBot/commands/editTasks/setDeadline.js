const {
  ButtonBuilder,
  ButtonStyle,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
};

// Create Next and Previous Buttons

const nextButton = new ButtonBuilder()
  .setCustomId("next_column")
  .setLabel("Next")
  .setStyle("Primary");

const prevButton = new ButtonBuilder()
  .setCustomId("prev_column")
  .setLabel("Previous")
  .setStyle("Secondary");

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

  await interaction.update({
    content: `Select a task from: ${column.title}`,
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
    ephemeral: true,
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
  await interaction.deferReply({ ephemeral: true });

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

  const columnMenuResponse = await interaction.editReply({
    content: `Select a task from: ${column.title}`,
    components: [
      selectMenu,
      new ActionRowBuilder().addComponents(prevButton, nextButton),
    ],
    ephemeral: true,
  });

  // Wait for user to select a task
  const collectorFilter = (i) => i.user.id === interaction.user.id;

  try {
    const confirmation = await columnMenuResponse.awaitMessageComponent({
      filter: collectorFilter,
      time: 60000,
    });

    // Check which task was selected
    let selectedTask;
    const tasksResponse = await axios.post(
      `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
      {
        taskIds: [confirmation.value],
      }
    );
    selectedTask = tasksResponse.data[0];
  } catch (e) {
    await interaction.editReply({
      content: "Task not selected within 1 minute, command cancelled",
      components: [],
      ephemeral: true,
    });
  }

  // Ask user for due date

  // const dateInput = new TextInputBuilder()
  //   .setCustomId("dateInput")
  //   .setPlaceholder("DD/MM/YYYY")
  //   .setMinLength(10)
  //   .setMaxLength(10)
  //   .setStyle(TextInputStyle.Short)
  //   .setRequired(true);

  // const dateModalComponent = new ActionRowBuilder().addComponents(dateInput);

  // const dateModal = new ModalBuilder()
  //   .setCustomId("dateModal")
  //   .setTitle("Set deadline")
  //   .addComponents(dateModalComponent);

  // await interaction.showModal(dateModal);

  // // Wait for user to submit due date

  // client.on(Events.InteractionCreate, async (interaction) => {
  //   if (!interaction.isModalSubmit()) return;
  //   if (interaction.customId === "dateModal") {
  //     const dueDate = interaction.fields.getTextInputValue("dateInput");

  //     // Check if due_date is valid

  //     const dateFormatRegex =
  //       /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  //     if (!dateFormatRegex.test(dueDate)) {
  //       await interaction.reply({
  //         content: "Please use the format DD/MM/YYYY",
  //         ephemeral: true,
  //       });
  //       return;
  //     }

  //     // Set deadline to task in web server

  //     try {
  //       axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
  //         newTask: {
  //           taskId: selectedTask.taskId,
  //           due_date: dueDate,
  //         },
  //       });

  //       await interaction.reply(
  //         `Your task has been assigned the due date: ${dueDate}`
  //       );
  //     } catch (error) {
  //       console.error("Error fetching tasks: ", error.message);
  //       await interaction.reply(
  //         "Sorry, something went wrong while updating your task."
  //       );
  //     }
  //   }
  // });
}
