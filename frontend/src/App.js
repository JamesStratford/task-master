import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React, { useState } from 'react';
import DiscordAuth from './components/DiscordOAuth';
import KanbanBoard from './components/Kanban/KanbanBoard';
import MeetingMinutes from './components/Kanban/MeetingMinutes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const discordServerId = process.env.REACT_APP_DISCORD_SERVER_ID;
  const discordChannelId = process.env.REACT_APP_DISCORD_CHANNEL_ID;

  const handleTabSelect = (index) => {
    setActiveTabIndex(index);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTabIndex(0);
  }

  return (
    <div className="App-header">
      <DiscordAuth onLogin={handleLogin} onLogout={handleLogout} />
      {isAuthenticated && (
        <>
          <DiscordWidgetCrate server={discordServerId} channel={discordChannelId} on={isAuthenticated} />
          <Tabs onSelect={handleTabSelect}>
            <TabList>
              <Tab>Kanban Board</Tab>
              <Tab>Gantt Chart</Tab>
              <Tab>Calendar</Tab>
              <Tab>Discord</Tab>
              <Tab>Meeting Minutes</Tab> 
            </TabList>

            <TabPanel>
              <h2>Kanban</h2>
              <KanbanBoard />
            </TabPanel>

            <TabPanel>
              <h2>Gantt</h2>
            </TabPanel>

            <TabPanel>
              <h2>Calendar</h2>
            </TabPanel>


            <TabPanel>
            </TabPanel>

            <TabPanel>
              <MeetingMinutes />
            </TabPanel>
            
            {/* Always render DiscordWidget but hide it when the tab is not active */}
            <DiscordWidget
              server={discordServerId}
              channel={discordChannelId}
              visible={activeTabIndex === 3} // Show only when the Discord tab is active
            />
          </Tabs>
        </>
      )}
    </div>
  );
}

export default App;