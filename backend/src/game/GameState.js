const ROWS = 6;
const COLS = 7;

export class GameState {
  constructor(roomId, players) {
    this.roomId = roomId;
    this.players = players;
    this.board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    this.currentTurn = players[0];
    this.winner = null;
    this.lastActivity = Date.now();
  }

  makeMove(column, player) {
    if (this.winner) return null;
    if (this.currentTurn !== player) return null;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!this.board[row][column]) {
        this.board[row][column] = player;
        this.lastActivity = Date.now();
        
        if (this.checkWin(row, column)) {
          this.winner = player;
        }
        
        this.currentTurn = this.players.find(p => p !== player);
        return { row, column };
      }
    }
    return null;
  }

  checkWin(row, col) {
    const player = this.board[row][col];
    
    //horizontal
    if (this.countDirection(row, col, 0, 1, player) >= 4) return true;
    // vertical
    if (this.countDirection(row, col, 1, 0, player) >= 4) return true;
    // diagonal right
    if (this.countDirection(row, col, 1, 1, player) >= 4) return true;
    // diagonal left
    if (this.countDirection(row, col, 1, -1, player) >= 4) return true;
    
    return false;
  }

  countDirection(row, col, dRow, dCol, player) {
    let count = 1;
    
    //+
    for (let i = 1; i < 4; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || this.board[r][c] !== player) break;
      count++;
    }
    
    //-
    for (let i = 1; i < 4; i++) {
      const r = row - dRow * i;
      const c = col - dCol * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || this.board[r][c] !== player) break;
      count++;
    }
    
    return count;
  }

  isBoardFull() {
    return this.board[0].every(cell => cell !== null);
  }

  getValidColumns() {
    return this.board[0]
      .map((cell, idx) => cell === null ? idx : null)
      .filter(idx => idx !== null);
  }
}