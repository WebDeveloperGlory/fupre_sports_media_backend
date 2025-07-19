const { Server } = require('socket.io');
const client = require('socket.io-client');
const http = require('http');

// ======== Create test server ========
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = 4000;

// ======== Simulate backend logic ========
const fixtureId = '12345';

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-fixture', (id) => {
    console.log(`User joined fixture: ${id}`);
    socket.join(id);

    // Emit test payload after join
    setTimeout(() => {
      const testPayload = {
        type: 'score',
        fixtureId: id,
        data: {
          result: {
            homeScore: 2,
            awayScore: 1,
            updatedAt: new Date().toISOString(),
          },
        },
      };

      io.to(id).emit('fixture-update', testPayload);
      console.log('Emitted fixture-update to room:', id);
    }, 2000);
  });

  socket.on('leave-fixture', (id) => {
    socket.leave(id);
    console.log(`User left fixture: ${id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Test server listening on port ${PORT}`);
});

// ======== Optional: Listener Test (simulate frontend) ========
const testClient = client(`http://localhost:${PORT}`, {
  transports: ['websocket'],
});

testClient.on('connect', () => {
  console.log('Test client connected:', testClient.id);
  testClient.emit('join-fixture', fixtureId);
});

testClient.on('fixture-update', (data) => {
  console.log('[Test Client] Received fixture-update:', data);
});

testClient.on('disconnect', () => {
  console.log('Test client disconnected');
});
