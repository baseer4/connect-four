import express from 'express';
import { Player } from '../models/Player.js';
import { Game } from '../models/Game.js';

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const players = await Player.find()
      .sort({ wins: -1 })
      .limit(10)
      .select('username wins losses draws totalGames');
    
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/player/:username', async (req, res) => {
  try {
    const player = await Player.findOne({ username: req.params.username });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

router.get('/games/:username', async (req, res) => {
  try {
    const games = await Game.find({
      'players.username': req.params.username,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .limit(20)
      .select('roomId players winner moves completedAt');
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

export default router;