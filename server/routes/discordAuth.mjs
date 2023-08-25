import axios from 'axios';
import express from 'express';
const router = express.Router();

async function exchangeCodeForToken(code) {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `http://localhost:${process.env.DISCORD_PORT}`
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = await tokenResponse.data.access_token;
        console.log('Access token:', accessToken);
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return { user: userResponse.data };
    } catch (error) {
        console.error("Error during the OAuth exchange:", error);
        throw new Error('Authentication failed');
    }
}

router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        // User is authenticated
        console.log('User is authenticated');
        res.json({ isAuthenticated: true });
    } else {
        // User is not authenticated
        res.json({ isAuthenticated: false });
    }
});

router.get('/exchange', async (req, res) => {
    const { code } = req.query;
    try {
        const data = await exchangeCodeForToken(code);

        req.session.userId = data.user.id;
        req.session.save();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
