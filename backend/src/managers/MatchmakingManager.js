import { v4 as uuidv4 } from 'uuid';

export class MatchmakingManager {
  constructor() {
    this.waitingPlayers = [];
  }

  addToQueue(socketId, username) {
    const existing = this.waitingPlayers.find(p => p.socketId === socketId);
    if (existing) {
      // console.log(` ${socketId} already in queue`);
      return;
    }

    const player = {
      socketId,
      username,
      timestamp: Date.now()
    };

    this.waitingPlayers.push(player);
    // console.log(` Added to queue: ${socketId} (${username}). Queue size: ${this.waitingPlayers.length}`);
  }

  createMatch() {
    if (this.waitingPlayers.length < 2) {
      // console.log(` Not enough players. Queue size: ${this.waitingPlayers.length}`);
      return null;
    }

    const [player1, player2] = this.waitingPlayers.splice(0, 2);
    const roomId = uuidv4();

    // console.log(`Creating match between ${player1.socketId} and ${player2.socketId}`);

    return {
      roomId,
      players: [player1.socketId, player2.socketId],
      playerUsernames: [player1.username, player2.username],
      isBot: false
    };
  }

  matchWithBot(socketId) {
    const index = this.waitingPlayers.findIndex(p => p.socketId === socketId);
    if (index === -1) {
      // console.log(` ${socketId} not in queue anymore`);
      return null;
    }

    const player = this.waitingPlayers[index];
    this.waitingPlayers.splice(index, 1);
    const roomId = uuidv4();

    // console.log(` Creating bot match for ${socketId} (${player.username})`);

    return {
      roomId,
      players: [socketId, 'BOT'],
      playerUsernames: [player.username, 'BOT'],
      isBot: true
    };
  }

  removeFromQueue(socketId) {
    const index = this.waitingPlayers.findIndex(p => p.socketId === socketId);
    if (index !== -1) {
      this.waitingPlayers.splice(index, 1);
      // console.log(` Removed from queue: ${socketId}. Queue size: ${this.waitingPlayers.length}`);
    }
  }
}