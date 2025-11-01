import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(import.meta.env.VITE_BACKEND_LEADERBOARD_URL);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (wins, totalGames) => {
    if (totalGames === 0) return "0.0";
    return ((wins / totalGames) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 mt-20">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 mt-20">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-8 px-3 max-w-4xl w-full">
      <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
      
      {leaderboard.length === 0 ? (
        <p className="text-gray-600">No players yet. Be the first to play!</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-center">Wins</th>
                <th className="px-4 py-3 text-center">Losses</th>
                <th className="px-4 py-3 text-center">Draws</th>
                <th className="px-4 py-3 text-center">Total Games</th>
                <th className="px-4 py-3 text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr
                  key={player.username}
                  className={`border-b hover:bg-gray-50 ${
                    index < 3 ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold">{player.username}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-semibold">
                    {player.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">
                    {player.losses}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {player.draws}
                  </td>
                  <td className="px-4 py-3 text-center">{player.totalGames}</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {getWinRate(player.wins, player.totalGames)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={fetchLeaderboard}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}

