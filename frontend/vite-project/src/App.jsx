import { useEffect, useState } from 'react'
import axios from 'axios';
import { io } from "socket.io-client";
import "./utils/fixLeafletIcon";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import './App.css'
console.log("App Loaded");

function App() {
    
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    // Fetch initial disasters
    axios.get("http://localhost:5000/api/disasters")
      .then(res => {
        console.log("Initial disasters:", res.data);
        setDisasters(res.data);
      })
      .catch(err => console.error("API Error:", err));

    // Socket connection
    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disaster-update", (data) => {
      console.log("📍 New marker received:", data);
      setDisasters(prev => [...prev, data]);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1 style={{ textAlign: "center" }}>🚨 ADRC Disaster Map</h1>

      <MapContainer center={[28.6139, 77.2090]} zoom={5} style={{ height: "90%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {disasters.length > 0 && console.log("Rendering markers:", disasters)}
        {disasters.map(d => (
          <Marker key={d.id} position={[d.lat, d.lng]}>
            <Popup>{d.type}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

}

export default App
