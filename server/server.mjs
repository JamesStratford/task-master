import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import discordRoutes from "./routes/discordAuth.mjs"
import discordBotKanbanRoutes from "./routes/discord-bot/kanban.mjs";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.json());

app.use(cors({
  origin: `${process.env.ORIGIN}:${process.env.FRONTEND_PORT}`,
  credentials: true
}));


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
app.use('/api/discord-bot/kanban', discordBotKanbanRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app