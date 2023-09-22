import { createRequire } from 'module';
const require = createRequire(import.meta.url); // Initialize createRequire
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

  it('should send and receive a message', (done) => {
    clientSocket.on('message', (message) => {
      expect(message).to.equal('Hello, Client!');
      done();
    });

    serverSocket.send('Hello, Client!');
  });
});
