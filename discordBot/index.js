require("dotenv").config({ path: ".env" });
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
// require("./deploy-commands.js");

// Load commands

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {

            client.commands.set(command.data.name, command);

        } else {

            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)

        }

    }

}

// Load events

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {

    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {

        client.once(event.name, (...args) => event.execute(...args));

    } else {

        client.on(event.name, (...args) => event.execute(...args));

    }

}

// Start bot

client.login(process.env.TOKEN);