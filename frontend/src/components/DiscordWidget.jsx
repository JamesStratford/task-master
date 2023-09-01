import WidgetBot from '@widgetbot/react-embed'
import React, { useState, useEffect } from 'react'

let crateOn = false;

const DiscordWidgetCrate = (props) => {
    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
            script.async = true;
            script.defer = true;
            let crate;
            script.onload = () => {
                // Once the script is loaded, initialize the Crate object
                crate = new window.Crate({
                    server: props.server,
                    channel: props.channel,
                    glyph: ['https://cdn.discordapp.com/icons/1133857547305111592/bb123cd4ac09172b67bb767f51ac21c2.webp', '100%']
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
        };


        if (!crateOn)
        {
            crateOn = true;
            loadScript();
        }
        
        return () => {
            const scriptElement = document.querySelector(`script[src='https://cdn.jsdelivr.net/npm/@widgetbot/crate@3']`);
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
            const widgetElement = document.querySelector('widgetbot-crate');
            if (widgetElement) {
                widgetElement.remove();
                crateOn = false;
            }
        };
        
    }, [props.channel, props.server]);

    return null;
};


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
            display: props.visible ? 'grid' : 'none', // Hide or show based on the 'visible' prop
            placeItems: 'center',
            width: '100%',
            height: '10vh'
        }}>
            <WidgetBot
                width={width * 0.90}
                height={height * 0.85}
                server={props.server}
                channel={props.channel}
            />
        </div>
    );
}


export { DiscordWidget, DiscordWidgetCrate };



