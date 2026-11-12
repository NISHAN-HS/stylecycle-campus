const { Server } = require('socket.io');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.CLIENT_URL || '',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    // User joins with their userId
    socket.on('setup', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.join(userId);
        io.emit('user_status_change', {
          userId,
          status: 'online',
          onlineUserIds: Array.from(onlineUsers.keys()),
        });
      }
    });

    // Join room for a specific listing conversation
    socket.on('join_conversation', (room) => {
      socket.join(room);
    });

    // Real-time instant messaging
    socket.on('send_instant_message', (messageData) => {
      const { recipientId, conversationRoom } = messageData;
      // Emit to recipient's personal room
      if (recipientId) {
        socket.to(recipientId).emit('message_received', messageData);
      }
      // Also emit to conversation room if active
      if (conversationRoom) {
        socket.to(conversationRoom).emit('room_message', messageData);
      }
    });

    // Typing indicator
    socket.on('typing', ({ room, senderName }) => {
      socket.to(room).emit('user_typing', { senderName });
    });

    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('user_stop_typing');
    });

    // Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedUserId = uid;
          onlineUsers.delete(uid);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit('user_status_change', {
          userId: disconnectedUserId,
          status: 'offline',
          onlineUserIds: Array.from(onlineUsers.keys()),
        });
      }
    });
  });

  return io;
};

module.exports = initSocket;

