import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, 
    secure: false,  // set this to true if you're using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

export { sessionMiddleware };
