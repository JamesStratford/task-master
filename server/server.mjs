import { createRequire } from 'module';
const require = createRequire(import.meta.url); // Initialize createRequire
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import discordRoutes from "./routes/discordAuth.mjs"
import discordKanbanRoutes from "./routes/discord-bot/kanban.mjs";
import kanbanRoutes from "./routes/kanbanBoard/kanbanBoardRoutes.mjs";
import discordWidgetRoutes from "./routes/discordWidget.mjs";
import "./loadEnvironment.mjs";
const socketIo = require('socket.io');
import { createServer } from 'http';

const PORT = process.env.PORT || 5050;
const app = express();
const server = createServer(app);

app.use(express.json());

const allowedOrigins = [
  'http://localhost:53134',
  'http://localhost:5050',

  `${process.env.ORIGIN}`,
  `${process.env.FRONTEND_ORIGIN}`,
  '*'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ dbName: 'sessionStore', mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
  cookie: {
    path    : '/',
    httpOnly: false,
    maxAge  : 24*60*60*1000
  },
}))

app.use("/api/discordAuth", discordRoutes);
app.use("/api/discord-bot/kanban", discordKanbanRoutes);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/discordWidget", discordWidgetRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const io = socketIo(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  socket.on('cursorMove', (data) => {
    // Broadcast the cursor position along with the socket ID to other connected clients
    socket.broadcast.emit('cursorMove', { id: socket.id, ...data });
  });
  
  socket.on('disconnect', () => {
    socket.broadcast.emit('cursorRemove', { id: socket.id });
  });

  socket.on('dragStart', (data) => {
    console.log('dragStart', data);
    socket.broadcast.emit('dragStart', { id: socket.id, ...data });
  });

  socket.on('dragUpdate', (data) => {
    socket.broadcast.emit('dragUpdate', { id: socket.id, ...data });
  });

  socket.on('dragEnd', (data) => {
    socket.broadcast.emit('dragEnd', { id: socket.id, ...data });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { io };
export default app