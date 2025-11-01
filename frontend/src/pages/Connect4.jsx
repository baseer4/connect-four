import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import WinnerOverlay from "../components/WinnerOverlay";

const ROWS = 6;
const COLS = 7;

export default function Connect4() {
  const [username, setUsername] = useState('');
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(null)));
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerUsernames, setPlayerUsernames] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(null);
  const [turn, setTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);
  const [isBot, setIsBot] = useState(false);
  
  const socketRef = useRef(null);
  const matchRequestedRef = useRef(false);

  useEffect(() => {
    if (usernameSubmitted && !socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
      
      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Connected:', socket.id);
        
        // Request match with username
        socket.emit("findMatch", { username: username.trim() });
      });

      socket.on('error', ({ message }) => {
        console.error('Socket error:', message);
        alert(message);
      });

      socket.on('waitingTime', ({ seconds }) => {
        setWaitingTime(seconds);
      });

      socket.on("waitingForOpponent", () => {
        console.log('Waiting for opponent...');
        setWaiting(true);
      });

      socket.on("matchFound", ({ roomId, players, playerUsernames, isBot }) => {
        console.log('Match found!', { roomId, players, playerUsernames, isBot });
        setRoomId(roomId);
        setPlayers(players);
        setPlayerUsernames(playerUsernames || []);
        setPlayerIndex(players.indexOf(socket.id));
        setTurn(players[0]);
        setWaiting(false);
        setWaitingTime(0);
        setIsBot(isBot);
        setWinner(null);
        setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(null)));
      });

      socket.on("moveMade", ({ column, player, nextTurn }) => {
        console.log('Move made:', { column, player, nextTurn });
        
        setBoard(prev => {
          const newBoard = prev.map(r => [...r]);
          for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][column]) {
              // Determine color based on player position
              const isPlayer1 = player === players[0];
              newBoard[r][column] = isPlayer1 ? "red" : "yellow";
              break;
            }
          }
          return newBoard;
        });
        setTurn(nextTurn);
      });

      socket.on("gameOver", ({ winner: gameWinner, winnerUsername }) => {
        console.log('Game over:', gameWinner, winnerUsername);
        
        if (gameWinner === socket.id) {
          setWinner("You");
        } else if (gameWinner === 'BOT') {
          setWinner("Bot");
        } else if (gameWinner === 'draw') {
          setWinner("Draw");
        } else {
          setWinner(winnerUsername || "Opponent");
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("waitingForOpponent");
        socketRef.current.off("waitingTime");
        socketRef.current.off("matchFound");
        socketRef.current.off("moveMade");
        socketRef.current.off("gameOver");
        socketRef.current.off("error");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [usernameSubmitted, username]);

  useEffect(() => {
    if (socketRef.current && players.length > 0) {
      const socket = socketRef.current;
      
      socket.off("moveMade");
      socket.on("moveMade", ({ column, player, nextTurn }) => {
        console.log('Move made:', { column, player, nextTurn });
        
        setBoard(prev => {
          const newBoard = prev.map(r => [...r]);
          for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][column]) {
              const isPlayer1 = player === players[0];
              newBoard[r][column] = isPlayer1 ? "red" : "yellow";
              break;
            }
          }
          return newBoard;
        });
        setTurn(nextTurn);
      });
    }
  }, [players]);

  const dropDisc = (col) => {
    if (winner || waiting || !socketRef.current) return;
    
    const socket = socketRef.current;
    if (turn !== socket.id) return;

    console.log('Making move:', { roomId, column: col });
    socket.emit("makeMove", { roomId, column: col });
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setUsernameSubmitted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTurnText = () => {
    if (waiting) {
      return `Waiting for opponent... (${formatTime(waitingTime)})`;
    }
    if (winner) {
      if (winner === "Draw") return "It's a draw!";
      return `${winner} wins!`;
    }
    if (!socketRef.current) return "Connecting...";
    
    const socket = socketRef.current;
    if (turn === socket.id) return "Your Turn (Red)";
    if (turn === 'BOT') return "Bot's Turn (Yellow)";
    return "Opponent's Turn (Yellow)";
  };
//username prompt
  if (!usernameSubmitted) {
    return (
      <div className="flex flex-col items-center gap-6 mt-20 px-3">
        <h1 className="text-3xl font-bold">Connect 4</h1>
        <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4 items-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg"
            required
            minLength={1}
            maxLength={20}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Start Game
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-8 px-3">
      <h1 className="text-3xl font-bold">Connect 4</h1>
      {playerUsernames.length > 0 && (
        <p className="text-sm text-gray-600">
          {playerUsernames[0]} vs {playerUsernames[1]}
        </p>
      )}

      <p className="text-lg font-semibold">{getTurnText()}</p>

      {isBot && !winner && (
        <p className="text-sm text-gray-500">Playing against Bot</p>
      )}

      <div className="relative">
        <motion.div
          layout
          className="bg-blue-600 rounded-2xl shadow-lg border-8 border-blue-700 grid grid-rows-6 grid-cols-7 sm:gap-2 gap-1 p-3 sm:p-4"
        >
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="sm:w-14 sm:h-14 w-10 h-10 bg-blue-800 rounded-full 
                  flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                onClick={() => dropDisc(cIdx)}
              >
                {cell && (
                  <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={`rounded-full shadow-inner ${
                      cell === "red" ? "bg-red-500" : "bg-yellow-500"
                    } sm:w-12 sm:h-12 w-9 h-9`}
                  />
                )}
              </div>
            ))
          )}
        </motion.div>
        <WinnerOverlay winner={winner} />
      </div>

      {winner && (
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Play Again
        </button>
      )}
    </div>
  );
}