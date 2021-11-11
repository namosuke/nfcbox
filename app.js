(async() => {

  const express = require('express');
  const app = express();
  const http = require('http');
  const server = http.createServer(app);
  const { Server } = require("socket.io");
  const io = new Server(server);

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
  });

  server.listen(3000, () => {
    console.log('listening on *:3000');
  });

  const NfcpyId = require('node-nfcpy-id').default;
  const nfc = new NfcpyId().start();

  nfc.on('touchstart', (card) => {
    console.log('touchstart', 'id:', card.id, 'type:', card.type);
    setLock(!isLock);
    io.emit('touched', 'touched');
  });

  nfc.on('touchend', () => {
    console.log('touchend');
  });

  nfc.on('error', (err) => {
    // standard error output (color is red)
    console.error('\u001b[31m', err, '\u001b[0m');
  });

  
  const { requestI2CAccess } = require('node-web-i2c');
  const i2cAccess = await requestI2CAccess();
  const port = i2cAccess.ports.get(1);
  const PCA9685 = require('@chirimen/pca9685');  // PWM?
  const pca9685 = new PCA9685(port, 0x40);
  let isLock = false;
  
  async function setLock(sw) {
    isLock = sw;
    let angle = 0;
    await pca9685.init(0.001, 0.002, 30);
    angle = sw ? -30 : 30;
    await pca9685.setServo(0, angle);
  }

})();