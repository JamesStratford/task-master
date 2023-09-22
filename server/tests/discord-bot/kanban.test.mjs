import chai from 'chai';
import chaiHttp from 'chai-http';
import express from 'express';
import discordBotKanbanRoutes from '../../routes/discord-bot/kanban.mjs';
import '../../loadEnvironment.mjs';

const { expect } = chai;
chai.use(chaiHttp);

describe('Discord bot - Kanban API', () => {
  let app;

  before(() => {
    app = express();
    app.use('/api/discord-bot/kanban/getTasks', (req, res, next) => {
      if (req.query.userId === '1') {
        return res.status(200).json({
          tasks: [
            { description: 'Dummy task 1', priority: '1' },
            { description: 'Dummy task 2', priority: '2' },
            { description: 'Dummy task 3', priority: '1' },
            { description: 'Dummy task 4', priority: '2' },
          ],
        });
      }
      next();
    });

    app.use('/api/discord-bot/kanban', discordBotKanbanRoutes);
  });

  describe('GET /getTasks', () => {
    it('should return tasks based on userId', (done) => {
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

