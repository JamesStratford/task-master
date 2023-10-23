const { execute } = require("../../../commands/misc/help.js");

const { EmbedBuilder } = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");
const realPath = jest.requireActual("node:path");

// Mocking the required modules
jest.mock("node:fs");
jest.mock("node:path");

describe("help command", () => {
  it("should return a list of commands", async () => {
    // Setup
    const mockInteraction = {
      reply: jest.fn(),
    };

    path.join.mockImplementation((...args) =>
      realPath.join("../../tests/commands/misc/testCommands", args[1])
    );
    fs.readdirSync
      .mockReturnValueOnce(["folder1"])
      .mockReturnValueOnce(["command1.js", "command2.js"]);

    // Execute
    await execute(mockInteraction);

    const testEmbed = new EmbedBuilder()
      .setTitle("Welcome to TaskMaster!")
      .setDescription(
        "> *Here is a list of commands:*\n\n" +
          "- **command1:**  \n\tdescription1\n\n" +
          "- **command2:**  \n\tdescription2\n\n"
      )
      .setColor("Green");
    // Assertion
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [testEmbed],
    });
  });
});
