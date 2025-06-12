import mongoose from 'mongoose';
import { config } from './env';

// Connect to MongoDB
mongoose.Promise = Promise;

mongoose.connect( config.MONGO_URI )
  .then(() => console.log('Connected to fupre_sports_media db'))
  .catch((err) => console.error('MongoDB connection error:', err));

// GENERAL MODEL IMPORTS //
import V2User from '../models/general/User';
import V2Notification from '../models/general/Notification';
import V2AuditLog from '../models/general/AuditLog';
// END OF GENERAL MODEL IMPORTS //

// FOOTBALL MODEL IMPORTS //
import V2FootballLiveFixture from '../models/football/LiveFixture';
// END OF FOOTBALL MODEL IMPORTS //

const db = {
    mongoose,
    V2User,
    V2Notification,
    V2AuditLog,
    V2FootballLiveFixture,
};

export default db;
