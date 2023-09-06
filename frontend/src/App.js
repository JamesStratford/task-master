import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React, { useState } from 'react';
import DiscordAuth from './components/DiscordOAuth';

import KanbanBoard from './components/KanbanBoard';
import initialData from './components/initialData';
import Column from './components/column';

function App() {
  const [state, setState] = useState(initialData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const discordServerId = process.env.REACT_APP_DISCORD_SERVER_ID;
  const discordChannelId = process.env.REACT_APP_DISCORD_CHANNEL_ID;

  const handleLogin = (isAuthed) => {
    setIsAuthenticated(isAuthed);
  }

  return (
    <div className="App-header">
      <DiscordAuth onLogin={handleLogin} />
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
