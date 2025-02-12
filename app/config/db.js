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
module.exports.AuditLog = require('../models/AuditLog');
module.exports.LiveFixture = require('../models/LiveFixture');
