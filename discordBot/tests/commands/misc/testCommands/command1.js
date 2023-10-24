const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("command1")
      .setDescription("description1"),
};