import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import discordRoutes from "./routes/discordAuth.mjs"
import MongoStore from "connect-mongo";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:53134',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
  cookie: {
    path    : '/',
    httpOnly: false,
    maxAge  : 24*60*60*1000
  },
}))

app.use("/api/discordAuth", discordRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
