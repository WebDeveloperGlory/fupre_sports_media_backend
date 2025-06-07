import mongoose from 'mongoose';
import { config } from './env';

// Connect to MongoDB
mongoose.Promise = Promise;

mongoose.connect( config.MONGO_URI )
  .then(() => console.log('Connected to fupre_sports_media db'))
  .catch((err) => console.error('MongoDB connection error:', err));

// MODEL IMPORTS //
import V2User from '../models/general/V2User';
// END OF MODEL IMPORTS //

const db = {
    mongoose,
    V2User,
};

export default db;
