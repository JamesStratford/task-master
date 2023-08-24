import axios from 'axios';

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

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return { user: userResponse.data };
    } catch (error) {
        console.error("Error during the OAuth exchange:", error.message);
        throw new Error('Authentication failed');
    }
}

export { exchangeCodeForToken };
