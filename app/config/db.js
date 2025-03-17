const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const URI = MONGO_URI;
mongoose.Promise = Promise;

mongoose.connect( URI )
    .then( ( res ) => console.log('Connected to fupre_sports_media db') )
    .catch( ( err ) => console.log( err ) );

module.exports.User = require('../models/User');
module.exports.Team = require('../models/Team');
module.exports.Player = require('../models/Player');
module.exports.PlayerCompetitionStats = require('../models/PlayerCompetitionStats');
module.exports.Competition = require('../models/Competition');
module.exports.Fixture = require('../models/Fixture');
module.exports.MatchStatistic = require('../models/MatchStatistic');
module.exports.MatchEvent = require('../models/MatchEvent');
module.exports.Notification = require('../models/Notification');
module.exports.LiveFixture = require('../models/LiveFixture');

// GENERAL SCHEMAS //
module.exports.AuditLog = require('../models/general/AuditLog');
module.exports.RefactoredUser = require('../models/general/User');
module.exports.RefactoredCompetition = require('../models/general/Competition');
//END OF GENERAL SCHEMAS //

// FOOTBALL SCHEMAS //
module.exports.FootballTeam = require('../models/football/FootballTeam');
module.exports.FootballPlayer = require('../models/football/FootballPlayer');
module.exports.FootballPlayerCompetitionStat = require('../models/football/FootballPlayerCompetitionStat');
module.exports.FootballCompetition = require('../models/football/FootballCompetition');
module.exports.FootballFixture = require('../models/football/FootballFixture');
module.exports.FootballMatchStatistic = require('../models/football/FootballMatchStatistic');
module.exports.FootballLiveFixture = require('../models/football/FootballLiveFixture');
// END OF FOOTBALL SCHEMAS //