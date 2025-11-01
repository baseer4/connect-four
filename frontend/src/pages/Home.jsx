import { Link } from "react-router";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <h1 className="text-4xl font-bold">Connect 4</h1>
      <p className="text-gray-600 text-center max-w-md">
        Simple two-player game. Take turns dropping discs to connect four in a row.
      </p>
      <Link
        to="/game"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
      >
        Start Game
      </Link>
    </div>
  );
}
