const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Returns a list of possible commands"),

  async execute(interaction) {
    let commands = "";

    const foldersPath = path.join(__dirname, "../../commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        commands += `- **${command.data.name}:**  \n\t${command.data.description}\n\n`;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Welcome to TaskMaster!")
      .setDescription("> *Here is a list of commands:*\n\n" + commands)
      .setColor("Green");

    await interaction.reply({ embeds: [embed] });
  },
};
