export const setupGameSockets = (io) => {
  const games = {}; 

  io.on('connection', (socket) => {
    // console.log('a user connected', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      if (!games[roomId]) {
        games[roomId] = { board: Array(6).fill().map(() => Array(7).fill(null)), turn: 'red' };
      }
      io.to(roomId).emit('player_joined', { roomId });
    });

    socket.on('make_move', ({ roomId, column }) => {
      const game = games[roomId];
      if (!game) return;

      for (let row = 5; row >= 0; row--) {
        if (!game.board[row][column]) {
          game.board[row][column] = game.turn;
          game.turn = game.turn === 'red' ? 'yellow' : 'red';
          break;
        }
      }
      io.to(roomId).emit('board_update', game);
    });

    socket.on('disconnect', () => {
      // console.log('user disconnected', socket.id);
    });
  });
};
