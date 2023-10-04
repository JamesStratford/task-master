<div class="markdown prose w-full break-words dark:prose-invert dark">
    <hr>
    <h1>Task Master</h1>
    <h2>Overview</h2>
    <p>Task Master is a comprehensive task management system that integrates with Discord. It allows users to create,
        edit, and manage tasks directly from Discord or via a web interface. The project is built using Node.js, React,
        and MongoDB.
    </p>
    <h2>Features</h2>
    <h3>Discord Bot</h3>
    <ul>
        <li><strong>Create Tasks</strong>: Quickly create tasks with deadlines.</li>
        <li><strong>Edit Tasks</strong>: Modify existing tasks, change deadlines, or mark them as complete.</li>
        <li><strong>Set Reminders</strong>: Get notified about upcoming tasks.</li>
        <li><strong>View Tasks</strong>: View all your current tasks in a list or Kanban board format.</li>
    </ul>
    <h3>Web Interface</h3>
    <ul>
        <li><strong>Kanban Board</strong>: Drag and drop tasks to different columns based on their status.</li>
        <li><strong>Discord OAuth</strong>: Log in using your Discord account.</li>
    </ul>
    <h3>Server</h3>
    <ul>
        <li><strong>Discord Bot API</strong>: Handles all Discord bot commands.</li>
        <li><strong>Discord Authentication</strong>: Securely log in via Discord OAuth.</li>
    </ul>
    <h2>Installation</h2>
    <ol>
        <li>
            <p><strong>Clone the Repository</strong></p>
            <pre><div class="bg-black rounded-md mb-4">
             <div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs language-bash">git <span class="hljs-built_in">clone</span> https://github.com/JamesStratford/task-master.git
 </code></div></div></pre>
        </li>
        <li>
            <p><strong>Install Dependencies</strong></p>
            <pre><div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs">npm install
 </code></div>
 </div>
 </pre>
        </li>
        <li>
            <p><strong>Environment Variables</strong></p>
            <ul>
                <li>Create a <code>.env</code> file in the root directory.</li>
                <li>Add your Discord bot token and MongoDB URI.</li>
            </ul>
        </li>
        <li>
            <p><strong>Run the Project</strong></p>
            <pre><div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs language-sql">npm <span class="hljs-keyword">start</span>
 </code></div></div></pre>
        </li>
    </ol>
    <h2>Contributing</h2>
    <p>This project is done in collaboration with AUT university students for the Software Development Practice paper.
        Feel free to fork!
    </p>
    <h2>License</h2>
    <p>This project is licensed under the Apache-2.0 License.</p>
    <hr>
</div>