// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const configureMongoose = require('./config/mongoose');
const authRoutes = require('./routes/auth');

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// MongoDB connection using the function from configureMongoose.js
configureMongoose();

// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
