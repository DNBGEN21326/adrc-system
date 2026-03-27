const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Sample API
app.get("/api/disasters", (req, res) => {
  res.json([
    { id: 1, lat: 28.6139, lng: 77.2090, type: "Flood" }
  ]);
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("Client connected");
});

// Broadcast new disasters every 5 seconds to all connected clients
setInterval(() => {
  const newDisaster = {
    id: Date.now(),
    lat: 20 + Math.random() * 10,
    lng: 70 + Math.random() * 10,
    type: "Live Incident"
  };

  console.log(`📤 Broadcasting to ${io.engine.clientsCount} clients:`, newDisaster);
  io.emit("disaster-update", newDisaster);
}, 5000);

// Server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 WebSocket server ready for connections`);
});