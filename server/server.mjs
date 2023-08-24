import express from "express";
import cors from "cors";
import axios from "axios";
import { exchangeCodeForToken } from "./routes/discordAuth.mjs";
import { sessionMiddleware } from './sessionConfig.mjs';
//import "./loadEnvironment.mjs";
//import records from "./routes/record.mjs";
import dotenv from "dotenv";
dotenv.config();


const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.json());
app.use(cors({
  credentials: true
}));
app.use(sessionMiddleware);

//app.use("/record", records);


app.post('/api/exchange', async (req, res) => {
  const { code } = req.body;
  try {
    const data = await exchangeCodeForToken(code);

    // Assuming the returned data contains a user object with an id property
    req.session.userId = data.user.id;
    req.session.save(err => {
      if (err) {
        return res.status(500).json({ error: "Failed to save session." });
      }
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/check-auth', (req, res) => {
  if (req.session.userId) {  // Assuming you store userId in the session upon successful authentication
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: true });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
