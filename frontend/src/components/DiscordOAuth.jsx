import React, { useState, useEffect } from 'react';

const DiscordAuth = (props) => {
    const [user, setUser] = useState(null);
    const clientID = '1144207341168885811';
    const redirectURI = 'http://localhost:53134';

    const handleLogin = () => {
        // Construct the Discord login URL
        const url = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=identify`;
        window.location.href = url;
    }

    useEffect(() => {
        // Check if there's a code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Call the /api/exchange endpoint to get user data
            fetch('http://localhost:5050/api/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.user) {
                        setUser(data.user);
                        if (props.onSuccessfulAuth) {
                            props.onSuccessfulAuth();
                        }
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch user data:', error);
                });
        }
    }, []);

    return (
        <div>
            {user ? (
                <div>
                    <p>Welcome, {user.username}!</p>
                    <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" />
                </div>
            ) : (
                <button onClick={handleLogin}>Login with Discord</button>
            )}
        </div>
    );
}

export default DiscordAuth;
