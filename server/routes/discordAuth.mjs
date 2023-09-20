import axios from 'axios';
import express from 'express';
import db from '../db/conn.mjs';

const router = express.Router();

function addUserToWhitelist(discordId) {
    db.collection('whitelist').updateMany({ discordId }, { $set: { isWhitelisted: true } }, { upsert: true }, (err, result) => {
        if (err) {
            console.log("An error occurred:", err);
            return;
        }
    });
}

async function exchangeCodeForToken(code) {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${process.env.FRONTEND_ORIGIN}:${process.env.FRONTEND_PORT}`
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = await tokenResponse.data.access_token;
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

router.get('/add-to-whitelist', async (req, res) => {
    const discordId = req.query.discordId;

    if (!discordId) {
        return res.status(400).json({ error: "Discord ID is required" });
    }

    addUserToWhitelist(discordId);
    res.status(200).json({ message: `Adding ${discordId} to the whitelist` });
});


router.get('/check-auth', async (req, res) => {
    if (req.session.userId) {
        const userDocument = await db.collection('whitelist').findOne({ discordId: req.session.userId });
        if (userDocument && userDocument.isWhitelisted) {
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

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


router.get('/exchange', async (req, res) => {
    const { code } = req.query;
    try {
        const data = await exchangeCodeForToken(code);

        req.session.userId = data.user.id;
        try {
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.error("Failed to save session:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        await db.collection('user-info').updateOne(
            { discordId: data.user.id },
            { $set: { ...data.user } },
            { upsert: true }
        );


        const userDocument = await db.collection('whitelist').findOne({ discordId: req.session.userId });
        if (userDocument && userDocument.isWhitelisted) {
            res.json({ isAuthenticated: true })
        } else {
            res.json({ isAuthenticated: false })
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
