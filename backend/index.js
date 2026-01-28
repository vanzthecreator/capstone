const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: "Life Signal Backend is running" });
});

// Example of a "Heavy Task" endpoint
// This simulates offloading image compression from the phone
app.post('/api/compress-media', (req, res) => {
  // In a real implementation, we would use 'sharp' or 'ffmpeg' here
  // to process files sent from the React Native app.
  
  // For now, we simulate the processing delay
  setTimeout(() => {
    res.json({ 
      success: true, 
      message: "Media compressed successfully on server",
      originalSize: "5MB",
      compressedSize: "1.2MB"
    });
  }, 1000);
});

// Example of Advanced Search endpoint
app.get('/api/search-users', (req, res) => {
  // Logic to search through thousands of users efficiently
  res.json({ 
    results: [
      { id: 1, name: "User A" },
      { id: 2, name: "User B" }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
