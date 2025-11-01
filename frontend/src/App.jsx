import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home";
import Connect4 from "./pages/Connect4";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 text-gray-900">
      <nav className="flex gap-6 py-6 text-lg font-medium">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link to="/game" className="hover:text-blue-600 transition-colors">Play</Link>
        <Link to="/leaderboard" className="hover:text-blue-600 transition-colors">Leaderboard</Link>
      </nav>

      <div className="w-full flex justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Connect4 />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </div>
  );
}
