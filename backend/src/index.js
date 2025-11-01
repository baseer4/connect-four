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
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
}); 
app.use(cors());
 app.use(express.json()); 
 connectDB();   
 setupSocketHandlers(io); 

app.use('/api', apiRoutes);





app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: Date.now() }); }); 
const PORT = process.env.PORT || 8000; 
httpServer.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
 });
