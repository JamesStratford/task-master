const axios = require('axios');
const { execute } = require('../../../commands/misc/checkAttendance.js');

jest.mock('axios');

// Mock interaction.reply so we can check if it's called and with what content
const mockInteractionReply = jest.fn();

const mockInteractionNotInChannel = {
  reply: mockInteractionReply,
  member: {
    voice: {
      channel: null
    }
  }
};

const mockInteractionInChannelAlone = {
  reply: mockInteractionReply,
  member: {
    voice: {
      channel: {
        members: [
          { displayName: 'JohnDoe' }
        ]
      }
    }
  }
};

const mockInteractionInChannelMultiple = {
  reply: mockInteractionReply,
  member: {
    voice: {
      channel: {
        members: [
          { displayName: 'JohnDoe' },
          { displayName: 'JaneDoe' },
          { displayName: 'Alice' }
        ]
      }
    }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('it should reply with an error if user is not in a voice channel', async () => {
  await execute(mockInteractionNotInChannel);

  expect(mockInteractionReply).toHaveBeenCalledWith('You must be in a voice channel to use this command.');
});

test('it should handle an error when fetching the "Meeting" column', async () => {
  axios.get.mockRejectedValueOnce(new Error('Fetch error'));

  await execute(mockInteractionInChannelAlone);

  expect(mockInteractionReply).toHaveBeenCalledWith('Error fetching or creating the Meetings column. Please try again.');
});

test('it should create the "Meeting" column if it does not exist', async () => {
  axios.get.mockResolvedValueOnce({ data: [] }); 
  axios.post.mockResolvedValueOnce({ data: { id: 'newColumnId' } }); 

  await execute(mockInteractionInChannelAlone);

  expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ title: 'Meetings' }));
});

test('it should handle an error when adding a task', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ title: 'Meetings', id: 'columnId' }] });
  axios.post.mockRejectedValueOnce(new Error('Post error'));

  await execute(mockInteractionInChannelAlone);

  expect(mockInteractionReply).toHaveBeenCalledWith("There was an error adding the task to the 'Meetings' column. Please try again.");
});

test('it should add a task when user is in a voice channel alone', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ title: 'Meetings', id: 'columnId' }] });
  axios.post.mockResolvedValueOnce({});

  await execute(mockInteractionInChannelAlone);

  const formattedDate = `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getDate()}, ${new Date().getFullYear()}`;
  expect(mockInteractionReply).toHaveBeenCalledWith(`The Meeting attendee on ${formattedDate}: JohnDoe has been added as a task in the 'Meetings' column!`);
});

test('it should add a task when multiple users are in the voice channel', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ title: 'Meetings', id: 'columnId' }] });
  axios.post.mockResolvedValueOnce({});

  await execute(mockInteractionInChannelMultiple);

  const formattedDate = `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getDate()}, ${new Date().getFullYear()}`;
  expect(mockInteractionReply).toHaveBeenCalledWith(`Meeting attendees for ${formattedDate}: JohnDoe, JaneDoe, Alice have been added as a task in the 'Meetings' column!`);
});
