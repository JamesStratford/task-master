import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React, { useState } from 'react';


function App() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div className="App">
      <Tabs onSelect={index => setActiveTabIndex(index)}>
        <TabList>
          <Tab>Title 1</Tab>
          <Tab>Discord</Tab>
        </TabList>

        <TabPanel className={activeTabIndex === 0 ? 'tab-panel active' : 'tab-panel'}>
          
        </TabPanel>
        <TabPanel className={activeTabIndex === 1 ? 'tab-panel active' : 'tab-panel'}>
          <DiscordWidget server='1133857547305111592' channel='1133857547816808530' />
        </TabPanel>
      </Tabs>
      <DiscordWidgetCrate server='1133857547305111592' channel='1133857547816808530' />
    </div>
  );
}

export default App;
