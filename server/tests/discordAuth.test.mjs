import app from "../server.mjs";
import session from 'express-session';
import chai from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
import request from 'supertest';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

chai.use(chaiHttp);
const mock = new AxiosMockAdapter(axios);

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

mock.onPost('https://discord.com/api/oauth2/token').reply(200, {
    access_token: 'mock_access_token',
});

mock.onGet('https://discord.com/api/users/@me').reply(200, {
    id: 'mock_user_id',
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

    it('/api/discordAuth/exchange -> should authenticate user successfully', function (done) {
        const mockCode = 'mock_code';
        app.request.session = { save: () => { done(); } };
        request(app)
            .get(`/api/discordAuth/exchange?code=${mockCode}`)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);

                expect(res.body).to.have.property('isAuthenticated', true);
                done();
            });
    });

    it('/api/discordAuth/exchange -> should return 500 if authentication fails', function(done) {
        mock.onPost('https://discord.com/api/oauth2/token').reply(400, {});
    
        request(app)
          .get('/api/discordAuth/exchange?code=bad_code')
          .expect(500)
          .end(function(err, res) {
            if (err) return done(err);
    
            expect(res.body).to.have.property('error', 'Authentication failed');
            done();
          });
      });

});
