import express from 'express';
import session from 'express-session';
import chai from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import discordRoutes from "../routes/discordAuth.mjs";

const app = express();
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      path    : '/',
      httpOnly: false,
      maxAge  : 24*60*60*1000
    },
  }))
  
app.use("/api/discordAuth", discordRoutes);

chai.use(chaiHttp);
const mock = new AxiosMockAdapter(axios);

app.use((req, res, next) => {
    req.session = {
        save: function(callback) {
            callback(null);
        },
        userId: null
    };
    next();
});

mock.onPost('https://discord.com/api/oauth2/token').reply(200, {
    access_token: 'mock_access_token',
});

mock.onGet('https://discord.com/api/users/@me').reply(200, {
    id: '123456789',
    username: 'mock_username',
});

describe("Discord Auth", () => {
    it("/api/discordAuth/add-to-whitelist -> Should return JSON 'message: Adding 123456789 to the whitelist'", () => {
        chai.request(app)
            .get("/api/discordAuth/add-to-whitelist?discordId=123456789")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal("Adding 123456789 to the whitelist");
            });
    });

    it("/api/discordAuth/check-auth -> Should return JSON 'isAuthenticated: True'", () => {
        // Simulate express session and set userId to equal 123456789
        app.request.session = { userId: "123456789" };
        chai.request(app)
            .get("/api/discordAuth/check-auth")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.isAuthenticated).to.be.true;
            });
    });

    it("/api/discordAuth/check-auth -> Should return JSON 'isAuthenticated: False'", () => {
        // Simulate express session and set userId to equal 987654321
        app.request.session = { userId: "987654321" };
        chai.request(app)
            .get("/api/discordAuth/check-auth")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.isAuthenticated).to.be.false;
            });
    });

    it('/api/discordAuth/exchange -> should authenticate user successfully', () => {
        const mockCode = 'mock_code';
        app.request.session = {
            save: function(callback) {
                callback(null);
            },
            userId: '123456789'
        };
        chai.request(app)
            .get(`/api/discordAuth/exchange?code=${mockCode}`)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('isAuthenticated', true);
            });
    });

});
