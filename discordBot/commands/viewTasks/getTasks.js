const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} = require("discord.js");
const axios = require("axios");

require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-tasks")
    .setDescription("Replies with the users current tasks"),

  execute: execute,
  getColumnMenu: getColumnMenu,
  handleGetTasksColumn: handleGetTasksColumn,
  handleGetTasksSelection: handleGetTasksSelection,
  handleGetTasksButtonEdit: handleGetTasksButtonEdit,
  handleGetTasksButtonDelete: handleGetTasksButtonDelete,
  handleGetTasksSelectName: handleGetTasksSelectName,
  handleGetTasksSelectDescription: handleGetTasksSelectDescription,
  handleGetTasksSelectStartDate: handleGetTasksSelectStartDate,
  handleGetTasksSelectDueDate: handleGetTasksSelectDueDate,
  handleGetTasksSelectAssignedUser: handleGetTasksSelectAssignedUser,
  handleGetTasksSelectLabels: handleGetTasksSelectLabels,
  handleGetTasksModalName: handleGetTasksModalName,
  handleGetTasksModalDescription: handleGetTasksModalDescription,
  handleGetTasksModalStartDate: handleGetTasksModalStartDate,
  handleGetTasksModalDueDate: handleGetTasksModalDueDate,
  handleGetTasksAssignedUserSelection: handleGetTasksAssignedUserSelection,
  handleGetTasksLabelsSelection: handleGetTasksLabelsSelection,
};

const nextButton = new ButtonBuilder()
  .setCustomId("get_tasks_next")
  .setLabel("Next")
  .setStyle(ButtonStyle.Primary);

const prevButton = new ButtonBuilder()
  .setCustomId("get_tasks_prev")
  .setLabel("Previous")
  .setStyle(ButtonStyle.Secondary);

let currentColumnIndex = 0;

/**
 * Executes the get-tasks command
 */
async function execute(interaction) {
  await interaction.deferReply();

  const userId = interaction.user.id;

  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  const selectMenu = await getColumnMenu();

  const columnResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-column-by-index/${currentColumnIndex}`
  );

  const column = columnResponse.data;

  nextButton.setDisabled(currentColumnIndex >= totalColumns - 1);
  prevButton.setDisabled(currentColumnIndex <= 0);

  const columnMenuEmbed = new EmbedBuilder()
    .setTitle("Select a Task to View")
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

/**
 * Creates a select menu for the column at the current index
 */
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
        .setCustomId("get_tasks_select")
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
      .setCustomId("get_tasks_select")
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

/**
 * Handles the column navigation
 */
async function handleGetTasksColumn(interaction) {
  const totalColumnsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-total-column-count`
  );

  const totalColumns = totalColumnsResponse.data.count;

  if (
    interaction.customId === "get_tasks_next" &&
    currentColumnIndex < totalColumns - 1
  ) {
    currentColumnIndex++;
  } else if (
    interaction.customId === "get_tasks_prev" &&
    currentColumnIndex > 0
  ) {
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
    .setTitle("Select a Task to View")
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

/**
 * Handles the select menu for tasks
 */
async function handleGetTasksSelection(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const editButton = new ButtonBuilder()
    .setCustomId(`get_tasks_edit:${selectedTaskId}`)
    .setLabel("Edit")
    .setStyle(ButtonStyle.Primary);

  const deleteButton = new ButtonBuilder()
    .setCustomId(`get_tasks_delete:${selectedTaskId}`)
    .setLabel("Delete")
    .setStyle(ButtonStyle.Danger);

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const selectedTask = tasksResponse.data[0];

  let user = "";

  if (selectedTask.assignedUser === "") {
    user = "None";
  } else {
    const userResponse = await interaction.client.users.fetch(
      selectedTask.assignedUser
    );
    user = userResponse.username;
  }

  const taskEmbed = new EmbedBuilder()
    .setTitle(`${selectedTask.content}`)
    .setDescription(
      `**Description:** \n\t${selectedTask.description}` +
        `\n\n**Start Date:** \n\t${selectedTask.startDate}` +
        `\n\n**Due Date:** \n\t${selectedTask.dueDate}` +
        `\n\n**Assigned User:** \n\t${user}` +
        `\n\n**Labels:** \n\t[${selectedTask.labels
          .map((label) => {
            return label.text;
          })
          .join("], [")}]`
    )
    .setColor("Blue");

  await interaction.editReply({
    embeds: [taskEmbed],
    components: [
      new ActionRowBuilder().addComponents(editButton, deleteButton),
    ],
  });
}

/**
 * Handles the edit button
 */
async function handleGetTasksButtonEdit(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const selectEdit = new StringSelectMenuBuilder()
    .setCustomId(`get_tasks_select_edit:${selectedTaskId}`)
    .setPlaceholder("Select a field to edit");

  const nameOption = {
    label: "Name",
    value: `name`,
  };

  const descriptionOption = {
    label: "Description",
    value: "description",
  };

  const startDateOption = {
    label: "Start Date",
    value: "startDate",
  };

  const dueDateOption = {
    label: "Due Date",
    value: "dueDate",
  };

  const assignedUserOption = {
    label: "Assigned User",
    value: "assignedUser",
  };

  const labelsOption = {
    label: "Labels",
    value: "labels",
  };

  selectEdit.addOptions(
    nameOption,
    descriptionOption,
    startDateOption,
    dueDateOption,
    assignedUserOption,
    labelsOption
  );

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const selectedTask = tasksResponse.data[0];

  let user = "";

  if (selectedTask.assignedUser === "") {
    user = "None";
  } else {
    user = await interaction.client.users.fetch(selectedTask.assignedUser)
      .username;
  }

  const taskEmbed = new EmbedBuilder()
    .setTitle(`${selectedTask.content}`)
    .setDescription(
      `**Description:** \n\t${selectedTask.description}` +
        `\n\n**Start Date:** \n\t${selectedTask.startDate}` +
        `\n\n**Due Date:** \n\t${selectedTask.dueDate}` +
        `\n\n**Assigned User:** \n\t${user}` +
        `\n\n**Labels:** \n\t[${selectedTask.labels
          .map((label) => {
            return label.text;
          })
          .join("], [")}]`
    )
    .setColor("Blue");

  await interaction.editReply({
    embeds: [taskEmbed],
    components: [new ActionRowBuilder().addComponents(selectEdit)],
  });
}

/**
 * Handles the delete button
 */
async function handleGetTasksButtonDelete(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  await axios.delete(`${process.env.SERVER_ORIGIN}/api/kanban/delete-task`, {
    data: {
      taskId: selectedTaskId,
    },
  });

  const deleteEmbed = new EmbedBuilder()
    .setTitle("Task Deleted")
    .setDescription(`Task: **${task.content}** has been deleted.`)
    .setColor("Green");

  await interaction.editReply({
    embeds: [deleteEmbed],
  });
}

/**
 * Handles the select menu option for editing name
 */
async function handleGetTasksSelectName(interaction, selectedTaskId) {
  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  const editModal = new ModalBuilder()
    .setCustomId(`get_tasks_modal_name:${selectedTaskId}`)
    .setTitle("Edit Name");

  const nameInput = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Name")
      .setValue(task.content)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
  );

  editModal.addComponents(nameInput);

  await interaction.showModal(editModal);
}

/**
 * Handles the select menu option for editing description
 */
async function handleGetTasksSelectDescription(interaction, selectedTaskId) {
  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  const editModal = new ModalBuilder()
    .setCustomId(`get_tasks_modal_description:${selectedTaskId}`)
    .setTitle("Edit Description");

  const descriptionInput = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Description")
      .setValue(task.description)
      .setStyle(TextInputStyle.Paragraph)
  );

  editModal.addComponents(descriptionInput);

  await interaction.showModal(editModal);
}

/**
 * Handles the select menu option for editing start date
 */
async function handleGetTasksSelectStartDate(interaction, selectedTaskId) {
  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  const editModal = new ModalBuilder()
    .setCustomId(`get_tasks_modal_startDate:${selectedTaskId}`)
    .setTitle("Edit Start Date");

  const startDateInput = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId("startDate")
      .setLabel("Start Date *YYYY-MM-DD*")
      .setValue(task.startDate)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(10)
  );

  editModal.addComponents(startDateInput);

  await interaction.showModal(editModal);
}

/**
 * Handles the select menu option for editing due date
 */
async function handleGetTasksSelectDueDate(interaction, selectedTaskId) {
  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  const editModal = new ModalBuilder()
    .setCustomId(`get_tasks_modal_dueDate:${selectedTaskId}`)
    .setTitle("Edit Due Date");

  const dueDateInput = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId("dueDate")
      .setLabel("Due Date *YYYY-MM-DD*")
      .setValue(task.dueDate)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(10)
  );

  editModal.addComponents(dueDateInput);

  await interaction.showModal(editModal);
}

/**
 * Handles the select menu option for editing assigned user
 */
async function handleGetTasksSelectAssignedUser(interaction, selectedTaskId) {
  await interaction.message.delete();

  const userSelect = new UserSelectMenuBuilder()
    .setCustomId(`get_tasks_select_assignedUser:${selectedTaskId}`)
    .setPlaceholder("Select a user");

  const userEmbed = new EmbedBuilder()
    .setTitle("Select a User")
    .setDescription("Select a user to assign to this task")
    .setColor("Blue");

  await interaction.reply({
    embeds: [userEmbed],
    components: [new ActionRowBuilder().addComponents(userSelect)],
  });
}

/**
 * Handles the select menu option for editing labels
 */
async function handleGetTasksSelectLabels(interaction, selectedTaskId) {
  await interaction.deferReply();

  await interaction.message.delete();

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  let currentLabels = "";

  for (let i = 0; i < task.labels.length; i++) {
    currentLabels += `- **${task.labels[i].text}**\n`;
  }

  const labelsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-all-labels`
  );

  const labels = labelsResponse.data;

  const labelSelect = new StringSelectMenuBuilder()
    .setCustomId(`get_tasks_select_labels:${selectedTaskId}`)
    .setPlaceholder("Select a label")
    .setMinValues(1)
    .setMaxValues(labels.length);

  const labelOptions = labels.map((label) => {
    return {
      label: label.text,
      value: label.labelId.toString(),
    };
  });

  labelSelect.addOptions(labelOptions);

  const labelEmbed = new EmbedBuilder()
    .setTitle("Select Labels")
    .setDescription(
      `\n${currentLabels}\n*Selecting current labels will remove them.*`
    )
    .setColor("Blue");

  await interaction.editReply({
    embeds: [labelEmbed],
    components: [new ActionRowBuilder().addComponents(labelSelect)],
  });
}

/**
 * Handles the modal for editing name
 */
async function handleGetTasksModalName(interaction, selectedTaskId) {
  const name = interaction.fields.getTextInputValue("name");

  if (!name || name.trim() === "") {
    const invalidNameEmbed = new EmbedBuilder()
      .setTitle("Invalid Name")
      .setDescription("Please enter a valid name")
      .setColor("Red");

    const continueButton = new ButtonBuilder()
      .setCustomId(`get_tasks_continue:${selectedTaskId}`)
      .setLabel("Continue")
      .setStyle(ButtonStyle.Success);

    await interaction.reply({
      embeds: [invalidNameEmbed],
      components: [new ActionRowBuilder().addComponents(continueButton)],
    });
    return;
  }

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      content: name,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}

/**
 * Handles the modal for editing description
 */
async function handleGetTasksModalDescription(interaction, selectedTaskId) {
  const description = interaction.fields.getTextInputValue("description");

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      description: description,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}

/**
 * Handles the modal for editing start date
 */
async function handleGetTasksModalStartDate(interaction, selectedTaskId) {
  const dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  const date = interaction.fields.getTextInputValue("startDate");

  if (!dateFormatRegex.test(date)) {
    const invalidDateEmbed = new EmbedBuilder()
      .setTitle("Invalid Date")
      .setDescription("Please use the format YYYY-MM-DD")
      .setColor("Red");

    const continueButton = new ButtonBuilder()
      .setCustomId(`get_tasks_continue:${selectedTaskId}`)
      .setLabel("Continue")
      .setStyle(ButtonStyle.Success);

    await interaction.reply({
      embeds: [invalidDateEmbed],
      components: [new ActionRowBuilder().addComponents(continueButton)],
    });
    return;
  }

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      startDate: date,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}

/**
 * Handles the modal for editing due date
 */
async function handleGetTasksModalDueDate(interaction, selectedTaskId) {
  const dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  const date = interaction.fields.getTextInputValue("dueDate");

  if (!dateFormatRegex.test(date)) {
    const invalidDateEmbed = new EmbedBuilder()
      .setTitle("Invalid Date")
      .setDescription("Please use the format YYYY-MM-DD")
      .setColor("Red");

    const continueButton = new ButtonBuilder()
      .setCustomId(`get_tasks_continue:${selectedTaskId}`)
      .setLabel("Continue")
      .setStyle(ButtonStyle.Success);

    await interaction.reply({
      embeds: [invalidDateEmbed],
      components: [new ActionRowBuilder().addComponents(continueButton)],
    });
    return;
  }

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      dueDate: date,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}

/**
 * Handles the select menu for assigned user
 */
async function handleGetTasksAssignedUserSelection(
  interaction,
  selectedTaskId
) {
  const assignedUser = interaction.values[0];

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      assignedUser: assignedUser,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}

/**
 * Handles the select menu for labels
 */
async function handleGetTasksLabelsSelection(interaction, selectedTaskId) {
  const labels = interaction.values;

  const labelsResponse = await axios.get(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-all-labels`
  );

  const allLabels = labelsResponse.data;

  let selectedLabels = [];

  for (let i = 0; i < allLabels.length; i++) {
    if (labels.includes(allLabels[i].labelId.toString())) {
      selectedLabels.push(allLabels[i]);
    }
  }

  const tasksResponse = await axios.post(
    `${process.env.SERVER_ORIGIN}/api/kanban/get-tasks-by-ids`,
    {
      taskIds: [selectedTaskId],
    }
  );

  const task = tasksResponse.data[0];

  for (let i = 0; i < task.labels.length; i++) {
    const labelId = parseFloat(task.labels[i].labelId);

    if (!labels.includes(labelId.toString())) {
      selectedLabels.push(task.labels[i]);
    } else {
      selectedLabels = selectedLabels.filter((label) => {
        return label.labelId !== labelId;
      });
    }
  }

  await axios.put(`${process.env.SERVER_ORIGIN}/api/kanban/update-task`, {
    newTask: {
      taskId: selectedTaskId,
      labels: selectedLabels,
    },
  });

  await handleGetTasksSelection(interaction, selectedTaskId);
}
