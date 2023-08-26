import axios from 'axios';
import express from 'express';
import db from '../db/conn.mjs';

const router = express.Router();

function addUserToWhitelist(discordId) {
    console.log(`Adding ${discordId} to the whitelist`);

    db.collection('whitelist').updateMany({ discordId }, { $set: { isWhitelisted: true } }, { upsert: true }, (err, result) => {
        if (err) {
            console.log("An error occurred:", err);
            return;
        }
        console.log(`Added ${discordId} to the whitelist`);
    });
}


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
        console.log("Access token:", accessToken);
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


router.get('/check-auth', async (req, res) => {
    if (req.session.userId) {
        const userDocument = await db.collection('whitelist').findOne({ discordId: req.session.userId });
        if (userDocument.isWhitelisted) {
            // User is authenticated
            res.json({ isAuthenticated: true });

            return
        }
    }

    // User is not authenticated
    res.json({ isAuthenticated: false });
});

router.get('/get-user', async (req, res) => {
    if (req.session.userId) {
        const userDocument = await db.collection('user-info').findOne({ discordId: req.session.userId });
        res.json({ user: userDocument });
    } else {
        res.json({ user: null });
    }
});



router.get('/exchange', async (req, res) => {
    const { code } = req.query;
    try {
        const data = await exchangeCodeForToken(code);

        req.session.userId = data.user.id;
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        await db.collection('user-info').updateOne(
            { discordId: data.user.id },
            { $set: { ...data.user } },
            { upsert: true }
        );

        const userDocument = await db.collection('whitelist').findOne({ discordId: req.session.userId });
        if (userDocument.isWhitelisted) {
            res.json({ isAuthenticated: true })
        } else {
            res.json({ isAuthenticated: false })
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
