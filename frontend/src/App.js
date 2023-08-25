import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React, { useState } from 'react';
import DiscordAuth from './components/DiscordOAuth';

const discordServerId = '1133857547305111592';
const discordChannelId = '1133857547816808530';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
  }

  return (
    <div className="App-header">
      {!isAuthenticated && <DiscordAuth onSuccessfulAuth={handleSuccessfulAuth} />}
      {isAuthenticated && (
        <>
          <DiscordWidgetCrate server={discordServerId} channel={discordChannelId} />
          <Tabs>
            <TabList>
              <Tab>Kanban Board</Tab>
              <Tab>Gantt Chart</Tab>
              <Tab>Calendar</Tab>
              <Tab>Discord</Tab>
            </TabList>

            <TabPanel>
              <h2>Kanban</h2>
            </TabPanel>

            <TabPanel>
              <h2>Gantt</h2>
            </TabPanel>

            <TabPanel>
              <h2>Calendar</h2>
            </TabPanel>

            <TabPanel>
              <DiscordWidget server={discordServerId} channel={discordChannelId} />
            </TabPanel>
          </Tabs>
        </>
      )}

    </div>
  );
}

export default App;
