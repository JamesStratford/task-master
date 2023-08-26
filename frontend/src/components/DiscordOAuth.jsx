import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OauthPopup from 'react-oauth-popup';

const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DiscordAuth = (props) => {
    const [user, setUser] = useState(null);

    const clientID = process.env.REACT_APP_DISCORD_APP_CLIENT_ID;
    const redirectURI = frontendUrl;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=identify`;

    const handleLogin = (popupCode, params) => {
        const code = params.get('code');

        if (code) {
            console.log(backendUrl)
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
                                props.onLogin(true);
                                getUserInfo();
                            }
                        } else {
                            console.log('User not authenticated')
                        }
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch user data:', error);
                });
        }
    }

    const checkAuth = () => {
        axios.get(`${backendUrl}/api/discordAuth/check-auth`, { withCredentials: true })
            .then(response => {
                const data = response.data;
                if (data.isAuthenticated) {
                    console.log('checkAuth data:', data.isAuthenticated)
                    props.onLogin(true)


                    return true
                }
            })
            .catch(error => {
                console.error('Error checking authentication:', error);
            });
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
                props.onLogin(false);
            })
            .catch(error => {
                console.error('Failed to log out:', error);
            });
    };


    useEffect(() => {
        checkAuth()
        getUserInfo()
    }, []);

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
                    <div className="login-overlay">
                        <OauthPopup url={url} onCode={handleLogin} onClose={() => console.log('Closed Discord OAuth2 Window')} width={1000} height={1000}>
                            Login
                        </OauthPopup>
                    </div>
            }
        </div>
    );
}

export default DiscordAuth;
