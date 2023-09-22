import chai from 'chai';
import chaiHttp from 'chai-http';
import express from 'express';
import discordBotKanbanRoutes from '../../routes/discord-bot/kanban.mjs';
import insertDummyTasks from '../../routes/discord-bot/addDummyTasks.mjs';
import '../../loadEnvironment.mjs';

const { expect } = chai;
chai.use(chaiHttp);

describe('Discord bot - Kanban API', () => {
  let app;

  before(() => {
    app = express();
    app.use('/api/discord-bot/kanban', discordBotKanbanRoutes);
  });

  describe('GET /getTasks', () => {
    it('should return an error if no userId is provided', (done) => {
      chai.request(app)
        .get('/api/discord-bot/kanban/getTasks')
        .set('Authorization', `Bearer ${process.env.BOT_SERVER_AUTH_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error', 'User ID is required');
          done();
        });
    });

    it('should return tasks based on userId', (done) => {
      //insertDummyTasks("1");

      chai.request(app)
        .get('/api/discord-bot/kanban/getTasks')
        .query({ userId: 1 })
        .set('Authorization', `Bearer ${process.env.BOT_SERVER_AUTH_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.tasks).to.be.an('array').with.lengthOf(4);
          expect(res.body.tasks[0]).to.have.property('description', 'Dummy task 1');
          expect(res.body.tasks[0]).to.have.property('priority', '1');

          expect(res.body.tasks[1]).to.have.property('description', 'Dummy task 2');
          expect(res.body.tasks[1]).to.have.property('priority', '2');

          expect(res.body.tasks[2]).to.have.property('description', 'Dummy task 3');
          expect(res.body.tasks[2]).to.have.property('priority', '1');

          expect(res.body.tasks[3]).to.have.property('description', 'Dummy task 4');
          expect(res.body.tasks[3]).to.have.property('priority', '2');
          done();
        });
    });
  });
});
