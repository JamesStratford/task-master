import './App.css';
import { DiscordWidget, DiscordWidgetCrate } from './components/DiscordWidget';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import React, { useEffect, useState } from 'react';
import DiscordAuth from './components/DiscordOAuth';

const discordServerId = '1133857547305111592';
const discordChallengeId = '1133857547816808530';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
  }

  // useEffect(() => {
  //   fetch('http://localhost:5050/api/check-auth', {
  //     credentials: 'include',
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data.isAuthenticated) {
  //       setIsAuthenticated(true);
  //     }
  //     setIsLoading(false);  // Update loading state once check is complete
  //   })
  //   .catch(error => {
  //     console.error('Error checking authentication:', error);
  //     setIsLoading(false);  // Update loading state even on error
  //   });
  // }, []);

  // if (isLoading) {
  //   return <div>Loading...</div>;  // Or any other loading indication
  // }

  return (
    <div className="App-header">
      {!isAuthenticated && <DiscordAuth onSuccessfulAuth={handleSuccessfulAuth} /> }
      {isAuthenticated && (
        <>
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
        </>
      )}

    </div>
  );
}

export default App;
