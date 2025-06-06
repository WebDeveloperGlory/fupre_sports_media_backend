const { Server } = require('socket.io');
const { ALLOWED_ORIGINS } = require('./env');

let io;
const allowedOrigins = ALLOWED_ORIGINS;

const initializeWebSocket = ( server, corsOptions ) => {
    io = new Server(server, {
        cors: {
            origin: ( origin, callback ) => {
                if ( !origin || allowedOrigins.includes( origin ) ) {
                    callback( null, true );
                } else {
                    callback( new Error("Not allowed by CORS") );
                }
            },
            credentials: corsOptions.credentials
        }
    });

    io.on("connection", (socket) => {
        console.log(`Client connected: ${ socket.id }`);

        socket.on("joinMatch", ( matchId ) => {
            socket.join(`match-${matchId}`);
            console.log(`Client ${ socket.id } joined match ${ matchId }`);
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${ socket.id }`);
        });
    });
};

const emitLiveMatchUpdate = ( matchId, updatedData ) => {
    if ( io ) {
        io.to(`match-${matchId}`).emit("matchUpdate", updatedData);
    }
};

const joinMatchRoom = ( socket, matchId ) => {
    socket.join( `match-${ matchId }` );
};

module.exports = {
    initializeWebSocket,
    emitLiveMatchUpdate,
    joinMatchRoom
};