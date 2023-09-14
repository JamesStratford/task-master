import db from '../../db/conn.mjs';

async function insertDummyTasks(userId) {
  try {
    const tasksCollection = db.collection('tasks');

    // Dummy tasks data
    const dummyTasks = [
      { userId: userId, description: 'Dummy task 1', priority: "1" },
      { userId: userId, description: 'Dummy task 2', priority: "2" },
      { userId: userId, description: 'Dummy task 3', priority: "1" },
      { userId: userId, description: 'Dummy task 4', priority: "2" }
    ];

    // Insert dummy tasks into the tasks collection
    await tasksCollection.insertMany(dummyTasks);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export default insertDummyTasks;
