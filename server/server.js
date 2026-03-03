const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve the static React build from the root directory's dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback all other GET requests to the React SPA index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Store lobby data
const lobbies = {};

const generateCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
};

const COLORS = ['red', 'blue', 'green', 'orange'];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', (data, callback) => {
        const roomCode = generateCode();
        socket.join(roomCode);

        lobbies[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, name: data.playerName || 'Player 1', color: COLORS[0], ready: true }],
            started: false
        };

        callback({ success: true, roomCode: roomCode, players: lobbies[roomCode].players });
    });

    socket.on('join_room', (data, callback) => {
        const roomCode = data.roomCode.toUpperCase();
        if (lobbies[roomCode] && !lobbies[roomCode].started) {

            if (lobbies[roomCode].players.length >= 4) {
                return callback({ success: false, message: "Room is full (max 4 players)." });
            }

            socket.join(roomCode);
            const playerIndex = lobbies[roomCode].players.length;
            const newPlayer = { id: socket.id, name: data.playerName || `Player ${playerIndex + 1}`, color: COLORS[playerIndex], ready: true };

            lobbies[roomCode].players.push(newPlayer);

            io.to(roomCode).emit('lobby_update', lobbies[roomCode].players);
            callback({ success: true, roomCode: roomCode, players: lobbies[roomCode].players });
        } else {
            callback({ success: false, message: "Room not found or game already started." });
        }
    });

    socket.on('start_game', (roomCode) => {
        if (lobbies[roomCode] && lobbies[roomCode].host === socket.id) {
            lobbies[roomCode].started = true;
            io.to(roomCode).emit('game_started', lobbies[roomCode].players);
        }
    });

    // Handle generic state sync actions (like dice rolls, property buys)
    socket.on('sync_action', (data) => {
        // data should contain { roomCode, action }
        socket.to(data.roomCode).emit('sync_action', data.action);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Basic cleanup: if host leaves, room is destroyed. If player leaves, they are removed.
        for (const roomCode in lobbies) {
            const lobby = lobbies[roomCode];
            const playerIndex = lobby.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                if (lobby.host === socket.id) {
                    // Host disconnected, close room
                    socket.to(roomCode).emit('room_closed', { message: 'Host disconnected' });
                    delete lobbies[roomCode];
                } else {
                    // Player disconnected, remove them
                    lobby.players.splice(playerIndex, 1);
                    socket.to(roomCode).emit('lobby_update', lobby.players);
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Socket.io server listening on port ${PORT}`);
});
