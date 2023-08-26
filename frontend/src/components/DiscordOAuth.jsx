import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OauthPopup from 'react-oauth-popup';
const backendUrl = process.env.REACT_APP_BACKEND_URL;


const DiscordAuth = (props) => {
    const [user, setUser] = useState(null);
    const clientID = '1144207341168885811';
    const redirectURI = 'http://localhost:53134';
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

    }

    const checkAuth = () => {
        axios.get(`${backendUrl}/api/discordAuth/check-auth`, { withCredentials: true })
            .then(response => {
                const data = response.data;
                if (data.isAuthenticated) {
                    console.log('checkAuth data:', data.isAuthenticated)
                    setUser(data.user);
                    props.onSuccessfulAuth()

                    return true
                }
            })
            .catch(error => {
                console.error('Error checking authentication:', error);
            });
    }


    useEffect(() => {
        checkAuth()
    });

    return (
        <div>
            {
                <OauthPopup url={url} onCode={handleLogin} onClose={() => console.log('Closed Discord OAuth2 Window')}>Login with Discord</OauthPopup>
            }
        </div>
    );
}

export default DiscordAuth;
