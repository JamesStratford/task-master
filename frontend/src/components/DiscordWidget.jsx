import WidgetBot from '@widgetbot/react-embed'
import React, { useState, useEffect } from 'react'

const DiscordWidgetCrate = (props) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
        script.async = true;

        script.onload = () => {
            // Once the script is loaded, initialize the Crate object
            const crate = new window.Crate({
                server: props.server,
                channel: props.channel
            });

            crate.on('signIn', data => {
                console.log(`Guest signed in as ${data.name}`);
            });
        };

        // Append the script to the document
        document.body.appendChild(script);

        // Cleanup the script when the component unmounts
        return () => {
            document.body.removeChild(script);
        };
    })

    return null;
}

const DiscordWidget = (props) => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component is unmounted
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{ 
            display: 'grid', 
            placeItems: 'center', 
            width: '100%', 
            height: '10vh'  // 100vh for full viewport height
        }}>
            <WidgetBot
                width={width * 0.90}
                height={height * 0.90}
                server={props.server}
                channel={props.channel}
            />
        </div>
    );    
}

export { DiscordWidget, DiscordWidgetCrate };



