import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const WinnerOverlay = ({ winner }) => {
  const navigate = useNavigate();
  if (!winner) return null;

  const colorClasses =
    winner === "R"
      ? "from-red-500/90 via-red-600/70 to-red-800/90"
      : "from-yellow-400/90 via-yellow-500/70 to-yellow-600/90";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${colorClasses} backdrop-blur-md z-50`}
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="text-6xl sm:text-7xl font-extrabold text-white drop-shadow-lg mb-10"
      >
        {winner === "R" ? "Red Wins!" : "Yellow Wins!"}
      </motion.h1>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className={`px-8 py-3 text-lg font-semibold rounded-2xl shadow-lg text-gray-900 ${
          winner === "R" ? "bg-white/90" : "bg-white/80"
        } hover:bg-white`}
      >
        Home
      </motion.button>
    </motion.div>
  );
};

export default WinnerOverlay;
