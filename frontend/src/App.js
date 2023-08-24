import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React from 'react';


function App() {
  return (
    <div className="App">
      <Tabs>
        <TabList>
          <Tab>Title 1</Tab>
          <Tab>Discord</Tab>
        </TabList>

        <TabPanel>
          <h2>Any content 1</h2>
        </TabPanel>
        <TabPanel>
          <DiscordWidget server='1133857547305111592' channel='1133857547816808530' />
        </TabPanel>
      </Tabs>
      <DiscordWidgetCrate server='1133857547305111592' channel='1133857547816808530' />
    </div>
  );
}

export default App;
