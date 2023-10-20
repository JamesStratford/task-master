const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const command = require("../../../commands/viewTasks/getMyTasks.js");

// Mocking discord.js interaction
const mockInteraction = {
    user: { id: "123456" },
    reply: jest.fn(),
};

describe("Test /getMyTasks command", () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.reset();
    });

    it("should handle getting tasks", async () => {
        const fakeData = {
            tasks: [
                { description: "Do laundry", priority: 2 },
                { description: "Write code", priority: 1 },
            ],
        };

        // Mock the request
        mockAxios
            .onGet(`${process.env.SERVER_ORIGIN}/api/discord-bot/kanban/getTasks?userId=${mockInteraction.user.id}`)
            .reply(200, fakeData);

        await command.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith(
            "Here are your tasks:\n1. Write code (Priority: 1)\n2. Do laundry (Priority: 2)"
        );
    });

    it("should handle no tasks", async () => {
        // Mock the server response
        mockAxios.onGet(`${process.env.SERVER_ORIGIN}/api/discord-bot/kanban/getTasks?userId=${mockInteraction.user.id}`).reply(200, {
            tasks: [],
        });

        await command.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith("You have no tasks!");
    });
});
