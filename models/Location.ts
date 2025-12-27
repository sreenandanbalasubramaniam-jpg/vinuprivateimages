
import mongoose from 'mongoose';

/**
 * Mongoose Schema for storing user location data.
 * Uses GeoJSON format to enable MongoDB spatial indexing.
 */
const LocationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'Vinu Varshith CP'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  accuracy: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: String
});

// Create a 2dsphere index for spatial queries
LocationSchema.index({ location: '2dsphere' });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
