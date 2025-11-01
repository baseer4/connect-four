import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{
    socketId: String,
    username: String,
    isBot: { type: Boolean, default: false }
  }],
  winner: { type: String, default: null },
  moves: [{
    player: String,
    column: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'forfeited'],
    default: 'waiting'
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

export const Game = mongoose.model('Game', gameSchema);