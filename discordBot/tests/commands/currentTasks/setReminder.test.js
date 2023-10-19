const { EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");
const { execute } = require("../../../commands/reminders/setReminder.js");

const mockInteraction = {
    options: {
        getString: jest.fn(),
        getInteger: jest.fn(),
    },
    followUp: jest.fn(),
    reply: jest.fn(),
};

jest.mock("node-schedule", () => ({
    scheduleJob: jest.fn(),
}));

describe("Test /set-reminder command", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should send a confirmation message that the timer has been set", async () => {
        mockInteraction.options.getString.mockReturnValueOnce("Test Reminder");
        mockInteraction.options.getInteger
            .mockReturnValueOnce(30)
            .mockReturnValueOnce(2)
            .mockReturnValueOnce(1);

        await execute(mockInteraction);

        // Ensure scheduleJob was called with the correct arguments
        expect(schedule.scheduleJob).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Function)
        );

        const scheduledFunction = schedule.scheduleJob.mock.calls[0][1];
        await scheduledFunction();

        // Create the expected embed object for the reply
        const expectedEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription('Reminder for "Test Reminder" has been set to trigger in 1 days, 2 hours, and 30 minutes from now')

        expect(mockInteraction.reply).toHaveBeenCalledWith({
            embeds: [expectedEmbed],
        });
    });
});
it("should trigger the reminder once it has hit the specified time", async () => {
    mockInteraction.options.getString.mockReturnValueOnce("Test Reminder");
    mockInteraction.options.getInteger
        .mockReturnValueOnce(30)
        .mockReturnValueOnce(2)
        .mockReturnValueOnce(1);

    await execute(mockInteraction);

    expect(schedule.scheduleJob).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Function)
    );

    const scheduledFunction = schedule.scheduleJob.mock.calls[0][1];
    await scheduledFunction();

    // Create an instance of the EmbedBuilder with the expected data
    const expectedEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setDescription('Reminder for "Test Reminder" has been triggered!')

    expect(mockInteraction.followUp).toHaveBeenCalledWith({
        embeds: [expectedEmbed],
    });
});
