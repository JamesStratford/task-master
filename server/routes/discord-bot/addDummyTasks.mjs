import db from '../../db/conn.mjs';

async function run() {
  let client;

  try {
    const tasksCollection = db.collection('tasks');

    // Dummy tasks data
    const dummyTasks = [
      { userId: '219271204794662917', description: 'Dummy task 1', priority: 1 },
      { userId: '219271204794662917', description: 'Dummy task 2', priority: 2 },
      { userId: '219271204794662917', description: 'Dummy task 3', priority: 1 },
      { userId: '219271204794662917', description: 'Dummy task 4', priority: 2 }
    ];

    // Insert dummy tasks into the tasks collection
    await tasksCollection.insertMany(dummyTasks);
    console.log('Inserted dummy tasks');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the MongoDB client
    if (client) {
      await client.close();
    }
  }
}

export default run;
