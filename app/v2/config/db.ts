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
import V2Department from '../models/general/Department';
import V2Faculty from '../models/general/Faculty';
import V2Blog from '../models/general/Blog';
// END OF GENERAL MODEL IMPORTS //

// FOOTBALL MODEL IMPORTS //
import V2FootballLiveFixture from '../models/football/LiveFixture';
import V2FootballFixture from '../models/football/Fixture';
import V2FootballTeam from '../models/football/Team';
import V2FootballCompetition from '../models/football/Competition';
import V2FootballPlayer from '../models/football/Player';
// END OF FOOTBALL MODEL IMPORTS //

// BASKETBALL MODEL IMPORTS //
import V2BasketballPlayer from '../models/basketball/Player';
import V2BasketballPlayerCareerStat from '../models/basketball/PlayerCareerStat';
import V2BasketballPlayerContract from '../models/basketball/PlayerContract';
import V2BasketballPlayerSeasonStat from '../models/basketball/PlayerSeasonStat';
import V2BasketballTeam from '../models/basketball/Team';
// END OF BASKETBALL MODEL IMPORTS //

const db = {
  mongoose,
  V2User,
  V2Notification,
  V2AuditLog,
  V2Blog,
  V2Department,
  V2Faculty,

  V2FootballLiveFixture,
  V2FootballFixture,
  V2FootballTeam,
  V2FootballCompetition,
  V2FootballPlayer,

  V2BasketballPlayer,
  V2BasketballPlayerCareerStat,
  V2BasketballPlayerContract,
  V2BasketballPlayerSeasonStat,
  V2BasketballTeam,
};

export default db;
