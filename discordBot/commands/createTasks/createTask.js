const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("create-task")
        .setDescription("Create a new task!")
        .addStringOption(option =>
            option
                .setName("task_name")
                .setDescription("Enter the name of the task you want to create")
                .setRequired(true)
            )
        .addStringOption(option =>
            option
                .setName("column_name")
                .setDescription("Enter the name of the column you want to add the task to")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("task_description")
                .setDescription("Enter the description of the task you want to create")
            ),
    
    async execute(interaction) {

        // Identify user
        const userId = interaction.user.id;

        // Create a new task to be added to the database

        let columnName = interaction.options.getString("column_name")

        const columns = axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-columns`)

        const columnId = columns.find(column => column.name === columnName).columnId
        
        let task = {
            taskId: "1",
            content: interaction.options.getString("task_name"),
            due_date: "",
            description: interaction.options.getString("task_description"),
            labels: [],
            nextTaskId: ""
        }

        // Add task to database

        // Waiting for MongoDB integration

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-task`, {
            columnId,
            task
        })

    }

};