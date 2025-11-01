import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { setupSocketHandlers } from "./sockets/index.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8000; 

const io = new Server(httpServer, {
  cors: { origin: process.env.VITE_FRONTEND_URL, methods: ["GET", "POST"] },
}); 

connectDB();   

app.use(cors());
app.use(express.json()); 
setupSocketHandlers(io); 

app.use('/api', apiRoutes);

app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: Date.now() }); }); 

httpServer.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
 });
