import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React from 'react';

const discordServerId = '1133857547305111592';
const discordChallengeId = '1133857547816808530';

function App() {
  return (
    <div className="App-header">
      <DiscordWidgetCrate server={discordServerId} channel={discordChallengeId} />
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
          <DiscordWidget server={discordServerId} channel={discordChallengeId} />
        </TabPanel>
      </Tabs>
      
    </div>
  );
}

export default App;
