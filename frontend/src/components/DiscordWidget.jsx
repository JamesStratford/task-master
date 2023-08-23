import WidgetBot from '@widgetbot/react-embed'
import React, { useEffect } from 'react'

const DiscordWidgetCrate = () => {
    useEffect(() => {
      // Load the external script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
      script.async = true;
      
      script.onload = () => {
        // Once the script is loaded, initialize the Crate object
        const crate = new window.Crate({
          server: '1133857547305111592',
          channel: '1133857547816808530'
        });
  
        crate.notify('Test notification');
        
        crate.on('signIn', data => {
          console.log(`Guest signed in as ${data.name}`);
          crate.emit('sendMessage', 'Hello world');
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
}

export default function DiscordWidget(props) {
    return (
        <div>
            <WidgetBot
                width={props.width || "100%"}
                height={props.height || "500px"}
                server={props.server}
                channel={props.channel}
            />
            <DiscordWidgetCrate />
        </div>
    )
}


