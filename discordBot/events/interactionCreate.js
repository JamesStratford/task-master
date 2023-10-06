const { Events } = require("discord.js");
const { handleButtonClick } = require('./commands/editTasks/setDeadline');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
      if (
        interaction.customId === "next_column" ||
        interaction.customId === "prev_column"
      ) {
        await handleButtonClick(interaction);
      }
    }
  },
};
