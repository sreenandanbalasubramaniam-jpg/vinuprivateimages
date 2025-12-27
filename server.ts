
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Location from './models/Location';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// In production, use: process.env.MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/geoconsent';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB via Mongoose'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

/**
 * POST /api/location
 * Receives location data from the frontend and saves it to MongoDB.
 */
app.post('/api/location', async (req, res) => {
  try {
    const { coordinates, accuracy, userId, userAgent } = req.body;

    const newLocation = new Location({
      userId,
      location: {
        type: 'Point',
        coordinates: coordinates // [lng, lat]
      },
      accuracy,
      userAgent,
      timestamp: new Date()
    });

    await newLocation.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Location indexed in MongoDB successfully',
      data: newLocation 
    });
  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to write to database' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
