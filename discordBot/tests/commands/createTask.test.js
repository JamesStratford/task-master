const { execute } = require('../../../commands/reminders/createTask.js'); // Replace with the actual path to your module
const { MessageEmbed } = require('discord.js');

// Mock axios for testing
jest.mock('axios');

// Mock the interaction object
const mockInteraction = {
  user: {
    id: '1234567890', // Replace with a mock user ID
  },
  options: {
    getString: jest.fn(),
  },
  reply: jest.fn(),
};

describe('execute', () => {
  it('should handle case where column is not found', async () => {
    // Mock axios response
    axios.get.mockResolvedValue({ data: [] });

    // Set up the interaction options
    mockInteraction.options.getString.mockReturnValueOnce('Nonexistent Column');

    // Call the execute function
    await execute(mockInteraction);

    // Check if reply is called with the correct error message
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [expect.any(MessageEmbed)],
    });
  });

  it('should handle case where column is found', async () => {
    // Mock axios response
    axios.get.mockResolvedValue({
      data: [
        { title: 'Column1', id: '1' },
        { title: 'Column2', id: '2' },
      ],
    });

    // Set up the interaction options
    mockInteraction.options.getString.mockReturnValueOnce('Column1');

    // Call the execute function
    await execute(mockInteraction);

    // Check if reply is called with the correct success message
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [expect.any(MessageEmbed)],
    });
  });

  // Add more test cases as needed
});
