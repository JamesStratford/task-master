import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OauthPopup from 'react-oauth-popup';

const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DiscordAuth = (props) => {
    const [user, setUser] = useState(null);
    const [hasFailedLogin, setHasFailedLogin] = useState(false);

    const clientID = process.env.REACT_APP_DISCORD_APP_CLIENT_ID;
    const redirectURI = frontendUrl;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=identify`;

    const handleLogin = (popupCode, params) => {
        const code = params.get('code');

        if (code) {
            axios.get(`${backendUrl}/api/discordAuth/exchange`, {
                withCredentials: true,
                params: {
                    code: code
                }
            })
                .then(response => {
                    const data = response.data;
                    if (data) {
                        if (data.isAuthenticated) {
                            console.log('User Authenticated')
                            if (props.onLogin) {
                                props.onLogin();
                                getUserInfo();
                                setHasFailedLogin(false);
                            }
                        } else {
                            setHasFailedLogin(true);
                            console.log('User not authenticated')
                        }
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch user data:', error.message);
                });
        }
    }

    const getUserInfo = () => {
        axios.get(`${backendUrl}/api/discordAuth/get-user`, { withCredentials: true })
            .then(response => {
                const data = response.data;
                if (data) {
                    setUser(data.user);
                }
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    }

    const handleLogout = () => {
        axios.get(`${backendUrl}/api/discordAuth/logout`, { withCredentials: true })
            .then(response => {
                setUser(null);
                props.onLogout();
            })
            .catch(error => {
                console.error('Failed to log out:', error);
            });
    };


    useEffect(() => {
        const checkAuth = () => {
            axios.get(`${backendUrl}/api/discordAuth/check-auth`, { withCredentials: true })
                .then(response => {
                    const data = response.data;
                    if (data.isAuthenticated) {
                        props.onLogin()
                        getUserInfo()

                        return true
                    }
                })
                .catch(error => {
                    console.error('Error checking authentication:', error.message);
                });
        }

        checkAuth()
    }, [props]);

    return (
        <div>
            {
                user ?
                    <div className="header">
                        <span> Welcome, {user.global_name} </span>
                        <button className="logout-button" onClick={handleLogout}>
                            &#x1F6AA; Logout
                        </button>
                    </div>
                    :
                    <div className="login-overlay" style={{ display: 'flex', flexDirection: 'column' }}>
                        <OauthPopup url={url} onCode={handleLogin} onClose={() => { }} width={1000} height={1000}>
                            <div style={{ textAlign: 'center' }}>
                                Login
                            </div>
                        </OauthPopup>

                        <div style={{ textAlign: 'center' }}>
                            {hasFailedLogin && <span className="error">Not whitelisted, contact admin</span>}

                            {
                                // DEBUG MODE
                                // TODO: Remove this before production

                                // Discord User ID refers to a unique identifier for a user, this can be obtained
                                // via Discord developer mode. This is not the same as the username or nickname.
                                process.env.REACT_APP_DEBUG_MODE &&
                                <span className="error">
                                    <br />
                                    <input name="discord-id" type="text" placeholder="Discord User ID" />
                                    <button onClick={async () => {
                                        await axios.get(`${backendUrl}/api/discordAuth/add-to-whitelist`, {
                                            withCredentials: true,
                                            params: {
                                                discordId: document.getElementsByName('discord-id')[0].value
                                            }
                                        })
                                    }}>
                                        DEBUG: Add user ID to whitelist
                                    </button>
                                </span>
                            }

                        </div>
                    </div>
            }
        </div>
    );
}

export default DiscordAuth;
