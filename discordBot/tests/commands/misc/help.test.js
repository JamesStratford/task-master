const { execute } = require("../../../commands/misc/help.js");
const fs = require("node:fs");
const realPath = require("node:path");

// Mocking the required modules
jest.mock("node:fs");
jest.mock("node:path");

jest.mock(
  "../../commands/folder1/command2.js",
  () => ({
    data: {
      name: "command2",
      description: "description2",
    },
  }),
  { virtual: true }
);

describe("help command", () => {
  beforeEach(() => {
    const pathToHelp = require.resolve("../../../commands/misc/help.js");

    const helpDir = realPath.dirname(pathToHelp);

    const command1Path = realPath.join(
      helpDir,
      "../../commands/folder1/command1.js"
    );
    const command1PathNormal = realPath.normalize(command1Path);

    jest.domock(
      command1PathNormal,
      () => ({
        data: {
          name: "command1",
          description: "description1",
        },
      }),
      { virtual: true }
    );
  });

  it("should return a list of commands", async () => {
    // Setup
    const mockInteraction = {
      reply: jest.fn(),
    };

    path.join.mockImplementation((...args) => args.join("/"));
    fs.readdirSync
      .mockReturnValueOnce(["folder1"])
      .mockReturnValueOnce(["command1.js", "command2.js"]);

    // Execute
    await execute(mockInteraction);

    // Assertion
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [
        expect.objectContaining({
          title: "Welcome to TaskMaster!",
          description: expect.stringContaining(
            "- **command1:**  \n\tdescription1"
          ),
        }),
      ],
    });
  });
});
