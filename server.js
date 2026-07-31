const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Xonalar va ularning xabarlar tarixi
const roomMessages = {};

io.on('connection', (socket) => {

  // Foydalanuvchi xonaga kirganda
  socket.on('joinRoom', ({ user, room }) => {
    socket.join(room);
    socket.room = room;
    socket.user = user;

    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    // Sahifa yangilanganda ham eski xabarlar tarixini yuborish
    socket.emit('chatHistory', roomMessages[room]);
  });

  // Yangi xabar (matn yoki ovoz) kelganda
  socket.on('chatMessage', (data) => {
    if (roomMessages[data.room]) {
      roomMessages[data.room].push(data);
    }
    // Xabarni barcha ulanganlarga yuborish
    io.to(data.room).emit('message', data);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} manzilida ishlamoqda`);
});