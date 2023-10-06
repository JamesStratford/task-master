---

# Task Master

## Overview

Task Master is a comprehensive task management system that integrates with Discord. It allows users to create, edit, and manage tasks directly from Discord or via a web interface. The project is built using Node.js, React, and MongoDB.

## Features

### Discord Bot

- **Create Tasks**: Quickly create tasks with deadlines.
- **Edit Tasks**: Modify existing tasks, change deadlines, or mark them as complete.
- **Set Reminders**: Get notified about upcoming tasks.
- **View Tasks**: View all your current tasks in a list or Kanban board format.

### Web Interface

- **Kanban Board**: Drag and drop tasks to different columns based on their status.
- **Discord OAuth**: Log in using your Discord account.

### Server

- **Discord Bot API**: Handles all Discord bot commands.
- **Discord Authentication**: Securely log in via Discord OAuth.

## Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/JamesStratford/task-master.git
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Variables**
    - Create a `.env` file in the root directory.
    - Add your Discord bot token and MongoDB URI.

4. **Run the Project**

    ```bash
    npm start
    ```

## Contributing

This project is done in collaboration with AUT university students for the Software Development Practice paper. Feel free to fork!

## License

This project is licensed under the Apache-2.0 License.

---
