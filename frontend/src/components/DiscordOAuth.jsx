import React, { useState, useEffect } from 'react';
import axios from 'axios';


const DiscordAuth = (props) => {
    const [user, setUser] = useState(null);
    const clientID = '1144207341168885811';
    const redirectURI = 'http://localhost:53134';

    const handleLogin = () => {
        // Construct the Discord login URL
        const url = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=identify`;
        window.location.href = url;
    }

    const checkAuth = (props) => {
        axios.get('http://localhost:5050/api/discordAuth/check-auth', { withCredentials: true })
            .then(response => {
                const data = response.data;
                console.log('checkAuth data:', data.isAuthenticated)
                if (data.isAuthenticated) {
                    setUser(data.user);
                    props.onSuccessfulAuth();
                    return true
                }
            })
            .catch(error => {
                console.error('Error checking authentication:', error);
            });
            return false
    }


    useEffect(() => {
        if (checkAuth(props)) {
            return
        }

        // Check if there's a code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        // clear code param from url
        window.history.replaceState({}, '', '/');

        if (code) {
            axios.get('http://localhost:5050/api/discordAuth/exchange', {
                withCredentials: true,
                params: {
                    code: code
                }
            })
                .then(response => {
                    const data = response.data;
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
