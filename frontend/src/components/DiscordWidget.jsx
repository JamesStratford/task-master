import WidgetBot from '@widgetbot/react-embed'
import React, { useEffect } from 'react'


const DiscordWidgetCrate = React.memo(function DiscordWidgetCrate(props) {
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
    }, []);

    return null;
})

const DiscordWidget = React.memo(function DiscordWidget(props) {
    return (
        <div>
            <WidgetBot
                width={props.width || "100%"}
                height={props.height || "500px"}
                server={props.server}
                channel={props.channel}
            />
        </div>
    )
})

export { DiscordWidget, DiscordWidgetCrate };



