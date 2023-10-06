import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import chai from 'chai';

const io = require('socket.io-client');
const { Server } = require('socket.io');

const expect = chai.expect;

describe('Socket.io Server Tests', () => {
  let serverSocket, clientSocket;

  before((done) => {
    const httpServer = require('http').createServer();
    const ioServer = new Server(httpServer);
    httpServer.listen(process.env.PORT || 5050, () => {
      clientSocket = io(`${process.env.ORIGIN}`);
      ioServer.on('connection', (socket) => {
        serverSocket = socket;
        done();
      });
    });
  });

  after(() => {
    serverSocket.disconnect();
    clientSocket.disconnect();
  });

  it('should broadcast cursor position to other clients', (done) => {
    const data = { id: 123, x: 100, y: 100 };
    clientSocket.on('cursorMove', (message) => {
      expect(message).to.eql(data);
      done();
    });
    serverSocket.emit('cursorMove', { id: 123, ...data });
  });
});