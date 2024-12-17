const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const URI = MONGO_URI;
mongoose.Promise = Promise;

mongoose.connect( URI )
    .then( ( res ) => console.log('Connected to fupre_sports_media db') )
    .catch( ( err ) => console.log( err ) );

// module.exports.User = require('../models/User');
// module.exports.Task = require('../models/Task');