import chai from 'chai';
import chaiHttp from 'chai-http';
import express from 'express';
import discordBotKanbanRoutes from '../../routes/discord-bot/kanban.mjs';

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
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error', 'User ID is required');
          done();
        });
    });

    it('should return tasks based on userId', (done) => {
      chai.request(app)
        .get('/api/discord-bot/kanban/getTasks?userId=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.tasks).to.be.an('array').with.lengthOf(2);
          expect(res.body.tasks[0]).to.have.property('description', 'test data');
          expect(res.body.tasks[0]).to.have.property('priority', '1');

          expect(res.body.tasks[1]).to.have.property('description', 'test data 2');
          expect(res.body.tasks[1]).to.have.property('priority', '2');
          done();
        });
    });
  });
});
