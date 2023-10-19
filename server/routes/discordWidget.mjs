import axios from 'axios';
import express from 'express';

const router = express.Router();

/**
 * Returns Discord server and channel credentials
 */
router.get('/discord-widget', async (req, res) => {
    try {
        const discordServerId = process.env.DISCORD_SERVER_ID;
        const discordChannelId = process.env.DISCORD_CHANNEL_ID;

        res.status(200).json({
            server: discordServerId,
            channel: discordChannelId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;