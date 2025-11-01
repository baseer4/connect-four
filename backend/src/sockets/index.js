import { MatchmakingManager } from '../managers/MatchmakingManager.js';
import { GameManager } from '../managers/GameManager.js';

const matchmaking = new MatchmakingManager();
const gameManager = new GameManager();

export function setupSocketHandlers(io) {
  gameManager.io = io;

  io.on('connection', (socket) => {
    // console.log(`Player connected: ${socket.id}`);

    const socketTimers = new Map();

    socket.on('findMatch', async ({ username }) => {
      if (!username || username.trim() === '') {
        socket.emit('error', { message: 'Username is required' });
        return;
      }

      if (socketTimers.has(socket.id)) {
        const { interval, timeout } = socketTimers.get(socket.id);
        clearInterval(interval);
        clearTimeout(timeout);
      }

      // console.log(`${socket.id} (${username}) looking for match`);

      socket.emit('waitingForOpponent');

      matchmaking.addToQueue(socket.id, username.trim());

      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        socket.emit('waitingTime', { seconds: elapsed });
      }, 1000);

      const match = matchmaking.createMatch();
      if (match) {
        clearInterval(timerInterval);
        socketTimers.delete(socket.id);
        await handleMatchFound(match, gameManager, io);
        return;
      }

      const botTimeout = setTimeout(async () => {
        clearInterval(timerInterval);
        socketTimers.delete(socket.id);
        const botMatch = matchmaking.matchWithBot(socket.id);
        if (botMatch) {
          // console.log(`Matching ${socket.id} with bot`);
          await handleMatchFound(botMatch, gameManager, io);
        }
      }, 10000);

      socketTimers.set(socket.id, { interval: timerInterval, timeout: botTimeout });
    });

    socket.on('makeMove', async ({ roomId, column }) => {
      // console.log(`Move from ${socket.id} in ${roomId}: column ${column}`);
      
      const result = await gameManager.makeMove(roomId, column, socket.id);
      
      if (result.success) {
        io.to(roomId).emit('moveMade', {
          column,
          player: socket.id,
          nextTurn: result.nextTurn
        });

        if (result.winner) {
          const winnerUsername = result.winner === 'BOT' ? 'BOT' : gameManager.socketToUsername.get(result.winner) || result.winner;
          io.to(roomId).emit('gameOver', { winner: result.winner, winnerUsername });
        }
      } else {
        // console.log(`Invalid move: ${result.error}`);
      }
    });

    socket.on('reconnect', ({ roomId }) => {
      const game = gameManager.handleReconnect(socket.id, roomId);
      if (game) {
        socket.join(roomId);
        socket.emit('gameState', {
          board: game.board,
          currentTurn: game.currentTurn,
          players: game.players
        });
      }
    });

    socket.on('disconnect', () => {
      // console.log(`Player disconnected: ${socket.id}`);
      
      // CleanUp
      if (socketTimers.has(socket.id)) {
        const { interval, timeout } = socketTimers.get(socket.id);
        clearInterval(interval);
        clearTimeout(timeout);
        socketTimers.delete(socket.id);
      }
      
      matchmaking.removeFromQueue(socket.id);
      gameManager.handleDisconnect(socket.id);
    });
  });
}

async function handleMatchFound(match, gameManager, io) {
  const { roomId, players, playerUsernames, isBot } = match;
  
  // console.log(`Creating match: ${roomId}`, { players, playerUsernames, isBot });
  
  await gameManager.createGame(roomId, players, playerUsernames, isBot);
  
  // Add players to room
  players.forEach(playerId => {
    if (playerId !== 'BOT') {
      const playerSocket = io.sockets.sockets.get(playerId);
      if (playerSocket) {
        playerSocket.join(roomId);
      }
    }
  });
  
  io.to(roomId).emit('matchFound', {
    roomId,
    players,
    playerUsernames,
    isBot
  });
  
  // console.log(`Match started: ${roomId}`);
}