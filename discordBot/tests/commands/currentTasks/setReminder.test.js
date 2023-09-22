const { SlashCommandBuilder } = require("discord.js");
const schedule = require("node-schedule");
const { execute } = require("../../../commands/reminders/setReminder.js"); // Assuming the module is in the same directory

// Mock the interaction object
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
        jest.clearAllMocks(); // Clear mock function calls before each test
    });

    it("should set a reminder", async () => {
        // Mock interaction options
        mockInteraction.options.getString.mockReturnValueOnce("Test Reminder");
        mockInteraction.options.getInteger
            .mockReturnValueOnce(30) // minutes
            .mockReturnValueOnce(2) // hours
            .mockReturnValueOnce(1); // days

        await execute(mockInteraction);

        // Ensure scheduleJob was called with the correct arguments
        expect(schedule.scheduleJob).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Function)
        );

        // Call the scheduled function
        const scheduledFunction = schedule.scheduleJob.mock.calls[0][1];
        await scheduledFunction(); // Simulate the scheduled function being called

        // Ensure followUp was called with the correct message
        expect(mockInteraction.followUp).toHaveBeenCalledWith('Reminder: "Test Reminder"');

        // Ensure reply was called with the confirmation message
        expect(mockInteraction.reply).toHaveBeenCalledWith(
            'Reminder set: "Test Reminder" for 1 days, 2 hours, and 30 minutes from now'
        );
    });

    it("should set a reminder with default values", async () => {
        // Mock interaction options with default values
        mockInteraction.options.getString.mockReturnValueOnce("Default Reminder");
        mockInteraction.options.getInteger.mockReturnValueOnce(1); // minutes

        await execute(mockInteraction);

        // Ensure scheduleJob was called with the correct arguments (default values)
        expect(schedule.scheduleJob).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Function)
        );

        // Call the scheduled function
        const scheduledFunction = schedule.scheduleJob.mock.calls[0][1];
        await scheduledFunction(); // Simulate the scheduled function being called

        // Ensure followUp was called with the correct message
        expect(mockInteraction.followUp).toHaveBeenCalledWith('Reminder: "Default Reminder"');

        // Ensure reply was called with the confirmation message
        expect(mockInteraction.reply).toHaveBeenCalledWith(
            'Reminder set: "Default Reminder" for 0 days, 0 hours, and 1 minutes from now'
        );
    });
});
