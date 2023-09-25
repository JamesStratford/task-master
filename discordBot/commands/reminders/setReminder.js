const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-reminder")
        .setDescription("Sets a reminder for a certain time")
        .addSubcommand(command => command
            .setName('set')
            .setDescription('Sets a reminder')
            .addStringOption(option => option
                .setName('reminder')
                .setDescription('Set your reminder text')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('minutes')
                .setDescription('How many minutes from now')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(59)
            )
            .addIntegerOption(option => option
                .setName('hours')
                .setDescription('How many hours from now')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(23)
            )
            .addIntegerOption(option => option
                .setName('days')
                .setDescription('How many days from now')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(31)
            )
        ),
    async execute(interaction) {
        const { options, guild } = interaction;
        const reminder = options.getString('reminder');
        const minutes = options.getInteger('minutes') || 0;
        const hours = options.getInteger('hours') || 0;
        const days = options.getInteger('days') || 0;

        // Calculate the time in minutes
        const timeInMinutes = minutes + hours * 60 + days * 24 * 60;

        // Schedule a reminder using node-schedule
        const scheduledTime = new Date(Date.now() + timeInMinutes * 60 * 1000);
        const job = schedule.scheduleJob(scheduledTime, async () => {

            const embedTrigger = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`Reminder for "${reminder}" has been triggered!`);

            await interaction.followUp({ embeds: [embedTrigger] });
        });

        // Reply to the user with confirmation
        const embedSet = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`Reminder for "${reminder}" has been set to trigger in ${days} days, ${hours} hours, and ${minutes} minutes from now`);

        await interaction.reply({ embeds: [embedSet] });
    },
};
