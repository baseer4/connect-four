import express from 'express';
import { createMatch, getMatch, joinMatch } from '../controllers/matchController.js';

const router = express.Router();

router.post('/create', createMatch);
router.get('/:id', getMatch);
router.post('/:id/join', joinMatch);

export default router;
