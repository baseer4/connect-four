const ROWS = 6;
const COLS = 7;

export class BotLogic {
  static getBotMove(gameState, botPlayer) {
    const opponent = gameState.players.find(p => p !== botPlayer);
    
    // 1. Check if bot can win
    const winMove = this.findWinningMove(gameState.board, botPlayer);
    if (winMove !== null) return winMove;
    
    // 2. Block opponent's winning move
    const blockMove = this.findWinningMove(gameState.board, opponent);
    if (blockMove !== null) return blockMove;
    
    // 3. Try to build towards a win
    const strategicMove = this.findStrategicMove(gameState.board, botPlayer);
    if (strategicMove !== null) return strategicMove;
    
    // 4. Default to center columns (better positioning)
    const validCols = gameState.getValidColumns();
    const centerCols = validCols.filter(c => c >= 2 && c <= 4);
    if (centerCols.length > 0) {
      return centerCols[Math.floor(Math.random() * centerCols.length)];
    }
    
    // 5. Random valid move
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  static findWinningMove(board, player) {
    for (let col = 0; col < COLS; col++) {
      const row = this.getLowestRow(board, col);
      if (row === -1) continue;
      
      board[row][col] = player;
      const isWin = this.checkWinAt(board, row, col, player);
      board[row][col] = null;
      
      if (isWin) return col;
    }
    return null;
  }

  static findStrategicMove(board, player) {
    let bestCol = null;
    let maxCount = 0;
    
    for (let col = 0; col < COLS; col++) {
      const row = this.getLowestRow(board, col);
      if (row === -1) continue;
      
      board[row][col] = player;
      const count = this.countThreats(board, row, col, player);
      board[row][col] = null;
      
      if (count > maxCount) {
        maxCount = count;
        bestCol = col;
      }
    }
    
    return bestCol;
  }

  static countThreats(board, row, col, player) {
    let threats = 0;
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    
    for (const [dRow, dCol] of directions) {
      const count = this.countInDirection(board, row, col, dRow, dCol, player);
      if (count >= 3) threats++;
    }
    
    return threats;
  }

  static countInDirection(board, row, col, dRow, dCol, player) {
    let count = 1;
    
    for (let i = 1; i < 4; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    
    for (let i = 1; i < 4; i++) {
      const r = row - dRow * i;
      const c = col - dCol * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    
    return count;
  }

  static checkWinAt(board, row, col, player) {
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    
    for (const [dRow, dCol] of directions) {
      if (this.countInDirection(board, row, col, dRow, dCol, player) >= 4) {
        return true;
      }
    }
    return false;
  }

  static getLowestRow(board, col) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) return row;
    }
    return -1;
  }
}