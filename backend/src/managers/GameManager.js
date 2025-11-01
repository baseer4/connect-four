import { GameState } from '../game/GameState.js';
import { BotLogic } from '../game/BotLogic.js';
import { Game } from '../models/Game.js';
import { Player } from '../models/Player.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.activeGames = new Map();
    this.disconnectedPlayers = new Map();
    this.socketToUsername = new Map(); 
    this.RECONNECT_TIMEOUT = 30000; 
  }

  async createGame(roomId, players, playerUsernames, isBot = false) {
    const gameState = new GameState(roomId, players);
    this.activeGames.set(roomId, gameState);

    players.forEach((socketId, index) => {
      if (socketId !== 'BOT') {
        this.socketToUsername.set(socketId, playerUsernames[index]);
      }
    });

    await Game.create({
      roomId,
      players: players.map((p, index) => ({
        socketId: p,
        username: playerUsernames[index],
        isBot: p === 'BOT'
      })),
      status: 'active'
    });

    return gameState;
  }

  async makeMove(roomId, column, playerId) {
    const game = this.activeGames.get(roomId);
    if (!game) return { success: false, error: 'Game not found' };

    const result = game.makeMove(column, playerId);
    if (!result) return { success: false, error: 'Invalid move' };

    await Game.findOneAndUpdate(
      { roomId },
      { $push: { moves: { player: playerId, column } } }
    );

    if (game.winner) {
      await this.endGame(roomId, game.winner);
      return { success: true, winner: game.winner, nextTurn: null };
    }

    if (game.isBoardFull()) {
      await this.endGame(roomId, null);
      return { success: true, winner: 'draw', nextTurn: null };
    }

    if (game.currentTurn === 'BOT') {
      setTimeout(() => {
        this.makeBotMove(roomId);
      }, 800);
    }

    return { success: true, nextTurn: game.currentTurn };
  }

  async makeBotMove(roomId) {
    const game = this.activeGames.get(roomId);
    if (!game || game.winner) return;

    const botColumn = BotLogic.getBotMove(game, 'BOT');
    const result = game.makeMove(botColumn, 'BOT');

    if (!result) return;

    this.io.to(roomId).emit('moveMade', {
      column: botColumn,
      player: 'BOT',
      nextTurn: game.currentTurn
    });

    await Game.findOneAndUpdate(
      { roomId },
      { $push: { moves: { player: 'BOT', column: botColumn } } }
    );

    if (game.winner) {
      await this.endGame(roomId, game.winner);
      const winnerUsername = game.winner === 'BOT' ? 'BOT' : this.socketToUsername.get(game.winner) || game.winner;
      this.io.to(roomId).emit('gameOver', { winner: game.winner, winnerUsername });
    } else if (game.isBoardFull()) {
      await this.endGame(roomId, null);
      this.io.to(roomId).emit('gameOver', { winner: 'draw', winnerUsername: null });
    }
  }

  async endGame(roomId, winner) {
    const game = this.activeGames.get(roomId);
    if (!game) return;

    await Game.findOneAndUpdate(
      { roomId },
      {
        winner,
        status: 'completed',
        completedAt: Date.now()
      }
    );

    const realPlayers = game.players.filter(p => p !== 'BOT');
    const winnerUsername = winner && winner !== 'BOT' ? this.socketToUsername.get(winner) : null;
    
    for (const playerId of realPlayers) {
      const username = this.socketToUsername.get(playerId);
      if (!username) continue;

      const isWinner = winner && winner !== 'BOT' && username === winnerUsername;
      const isDraw = winner === null;

      await Player.findOneAndUpdate(
        { username },
        {
          $inc: {
            totalGames: 1,
            wins: isWinner ? 1 : 0,
            losses: (!isWinner && !isDraw) ? 1 : 0,
            draws: isDraw ? 1 : 0
          },
          lastActive: Date.now()
        },
        { upsert: true }
      );
    }

    this.activeGames.delete(roomId);
  }

  handleDisconnect(socketId) {
    for (const [roomId, game] of this.activeGames.entries()) {
      if (game.players.includes(socketId)) {
        this.disconnectedPlayers.set(socketId, {
          roomId,
          timestamp: Date.now()
        });

        setTimeout(async () => {
          const disc = this.disconnectedPlayers.get(socketId);
          if (disc) {
            // Player didn't reconnect - forfeit
            const opponent = game.players.find(p => p !== socketId);
            await this.endGame(roomId, opponent);
            this.io.to(roomId).emit('gameOver', {
              winner: opponent,
              reason: 'opponent_disconnected'
            });
            this.disconnectedPlayers.delete(socketId);
          }
        }, this.RECONNECT_TIMEOUT);

        break;
      }
    }
  }

  handleReconnect(socketId, roomId) {
    const disc = this.disconnectedPlayers.get(socketId);
    if (disc && disc.roomId === roomId) {
      this.disconnectedPlayers.delete(socketId);
      return this.activeGames.get(roomId);
    }
    return null;
  }
}