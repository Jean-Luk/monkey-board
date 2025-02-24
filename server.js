const express = require('express');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const port = 8080;

const game = require('./game/game.js');
const { match } = require('assert');
const { count } = require('console');

(async function main () {
    app.use(express.static(__dirname + '/public'));
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/index.html');
    });
    
    app.get('/join=:key', function (req, res) {        
        res.sendFile(__dirname + '/public/index.html');
    })    
    const rooms = [];
    const clients = [];
    const matchQueue = [];


    /*
    Legend:
    _server_... -> Server emit globally
    server_... -> Server emit locally
    client_... -> Received from client
    */

    io.on('connection', function(socket) {
        // Send client Id once conected
        socket.emit('playerId', socket.id);
        clients.push({id:socket.id, currentRoomKey:null, nickname:null, onQueue:false})


        // Client request to create room:
        socket.on('client_createRoom', (clientNickname) => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO Retornar erro ao cliente;

            if (clients[clientIndex].currentRoomKey != null) return;

            clients[clientIndex].nickname = clientNickname;

            const newRoom = createRoom(rooms, clients[clientIndex]);

            console.log(`> ${socket.id} created room ${newRoom.key} as ${clientNickname}`)

            socket.emit('server_createdRoom', newRoom);
        })

        // Client request to join room:
        socket.on('client_joinRoom', (clientNickname, roomKey) => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return socket.emit("server_error_joinRoom", "Client not found; Try reloading the page.");
            const roomIndex = findRoomByKey (roomKey, rooms);
            if (roomIndex === false) return socket.emit("server_error_joinRoom", "Room not found."); 

            const room = rooms[roomIndex];

            if (clients[clientIndex].currentRoomKey == room.key) return;
            if (room.members.length >= 10) return socket.emit("server_error_joinRoom", "The room is currently full.")
            if (room.private) return socket.emit("This room is private.");

            const newPlayer = {
                id:socket.id, nickname:clientNickname,
                spectator: (countPlayers(room.members) >= 2) ? true : false, // If room already has 2 players, set as spectator
                victories:0
            }

            room.members.push(newPlayer);
            clients[clientIndex].currentRoomKey = roomKey;

            console.log(`> ${socket.id} joined room ${room.key} as ${clientNickname}`)

            io.emit('_server_joinedRoom', room, socket.id);

        })

        // Client request to join spectators:
        socket.on('client_joinSpectators', () => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return; // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);
            if (roomIndex === false) return; // !!! TODO

            const playerIndex = findMemberOnRoom(socket.id, rooms[roomIndex].players);
            if (playerIndex === false) return; // !!! TODO Player not found on room list;

            rooms[roomIndex].members[playerIndex].spectator = true;
            io.emit('_server_becameSpectator', rooms[roomIndex]);
        })
        
        // Client request to join players:
        socket.on('client_joinPlayers', () => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return; // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);
            if (roomIndex === false) return; // !!! TODO

            const playerIndex = findMemberOnRoom(socket.id, rooms[roomIndex].members);
            if (playerIndex === false) return; // !!! TODO Player not found on room list;

            if (countPlayers(rooms[roomIndex].members) >= 2) return; // Room already has 2 players;

            rooms[roomIndex].members[playerIndex].spectator = false;
            io.emit('_server_becamePlayer', rooms[roomIndex]);
        })

        // Client request to start game:
        socket.on('client_startGame', () => {
            const clientIndex = findClientById(socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return socket.emit("server_error_startGame", "Try reloading the page."); // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);

            if (roomIndex === false) return socket.emit("server_error_startGame", "Try reloading the page.");

            const room = rooms[roomIndex];
            const members = room.members;
            
            if (socket.id != room.owner) return socket.emit("server_error_startGame", "You are not the owner.");

            if (countPlayers(members) < 2) return socket.emit("server_error_startGame", "Not enough players in the room.");

            if (room.inGame) return socket.emit("server_error_startGame", "The room is already in a game.");
            
            const players = getPlayers(members);

            rooms[roomIndex].inGame = true;
            rooms[roomIndex].state = game.createNewGame(null, players);

            console.log(`> New game created on room ${rooms[roomIndex].key}`)
            io.emit("_server_gameStarted", rooms[roomIndex]);
        })

        // Client clicked "find match" button:
        socket.on('client_findMatch', (clientNickname) => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO Retornar erro ao cliente;

            if (clients[clientIndex].currentRoomKey != null) return;

            clients[clientIndex].onQueue = true;
            clients[clientIndex].nickname = clientNickname;
            matchQueue.push(socket.id);
            
            
            console.log(`> ${socket.id} is on queue as ${clientNickname}`);
            socket.emit("server_enteredQueue", clientNickname);
            
            if (matchQueue.length > 1) {
                const playersIds = [matchQueue[0], socket.id];

                const otherPlayerIndex = findClientById(matchQueue[0], clients);
                if (otherPlayerIndex === false) return matchQueue.splice(0, 1); // Player not found in queue list

                clients[clientIndex].onQueue = false;
                clients[otherPlayerIndex].onQueue = false;
                matchQueue.splice(0, 2);

                
                const newRoom = createRoom(rooms, clients[otherPlayerIndex], clients[clientIndex], true, true);

                const players = getPlayers(newRoom.members);

                newRoom.state = game.createNewGame(null, players);

                io.emit('_server_createdMatch', newRoom, playersIds);
            }
        })
        // Client asked to cancel queue:
        socket.on('client_cancelQueue', () => {

            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO Retornar erro ao cliente;

            leaveQueue(clients[clientIndex], matchQueue, socket);
        })
        // Client went back to lobby:
        socket.on("client_backToLobby", () => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return; // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);
            if (roomIndex === false) return; // !!! TODO

            socket.emit('server_wentBackToLobby', rooms[roomIndex]);

        })
        // Player executed action in-game:
        socket.on('client_executeAction', (command) => {
            const clientIndex = findClientById(socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return; // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);
            if (roomIndex === false) return; // !!! TODO

            game.executeAction(rooms[roomIndex].state, socket.id, command);
            
            if (rooms[roomIndex].state.winner != null) { // If a player won the game, emit a different command.
                rooms[roomIndex].inGame = false;
                io.emit("_server_playerWonGame", rooms[roomIndex])
            } else {
                io.emit("_server_playerExecutedAction", rooms[roomIndex])
                
            }
        })

        // Client request to leave a room:
        socket.on('client_leaveRoom', () => {
            const clientIndex = findClientById(socket.id, clients);

            if (clientIndex === false) return; // !!! TODO
            playerLeft(clients[clientIndex], rooms, io);
            
        })

        // Client request to watch match
        socket.on('client_watch_match', () => {
            const clientIndex = findClientById (socket.id, clients);
            if (clientIndex === false) return; // !!! TODO
            if (!clients[clientIndex].currentRoomKey) return; // Not in a room
            
            const roomIndex = findRoomByKey(clients[clientIndex].currentRoomKey, rooms);
            if (roomIndex === false) return; // !!! TODO

            socket.emit('server_playerWatchingMatch', rooms[roomIndex]);
            
        })

        socket.on('disconnect', () => {
            const clientIndex = findClientById(socket.id, clients);
            if (clientIndex === false) return;

            clientLeft(clients, clientIndex, rooms, matchQueue, io, socket);
        })
    })

    http.listen(port, function () {
        console.log(`> Server running on port: ${port}`);
    });
    
})();


// Return index if found, or false if not found:
function findClientById (clientId, clients) {
    for (let i in clients) {
        if (clients[i].id == clientId) return i
    }
    return false;
}
function findRoomByKey (roomKey, rooms) {
    for (let i in rooms) {
        if (rooms[i].key == roomKey) return i
    }
    return false;
}
function findMemberOnRoom (playerId, playerList) {
    for (let i in playerList) {
        if (playerList[i].id == playerId) return i;
    }
    return false;
}

// Generate a new key for each created room:
function generateRoomKey (rooms) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const keyLength = 5;
    let newKey;

    do {
        newKey = ""
        for (let i=0; i<keyLength; i++) {
            newKey += chars[Math.floor(Math.random() * chars.length)];
        }
    } while (!(findRoomByKey(newKey, rooms) === false));

    return newKey;
}

// Count how many players the room currently have:
function countPlayers (memberArray) {
    let quantity = 0;
    for(let m of memberArray) {
        if(!m.spectator) quantity++;
    }
    return quantity;
}

function getPlayers (memberArray) {
    const playerArray = [];
    for (let m of memberArray) {
        if (!(m.spectator)) {
            playerArray.push(m);
        }
    }
    return playerArray;
}
// Handle client disconnecting from the server
function clientLeft (clients, clientIndex, rooms, matchQueue, io, socket) {
    const client = clients[clientIndex];
    if (client.currentRoomKey) { // If the client was on a room, handle it:
        playerLeft(client, rooms, io);
    }
    if (client.onQueue) { // If the client was on the queue, remove it:
        leaveQueue(client, matchQueue, socket);
    }

    // Remove from the clients array;
    clients.splice(clientIndex, 1);
}

// Handle player disconnecting from/leaving a room
function playerLeft (client, rooms, io) {
    const roomIndex = findRoomByKey(client.currentRoomKey, rooms);
    if (roomIndex === false) return; // !!! TODO Room not found

    const room = rooms[roomIndex]

    const playerIndex = findMemberOnRoom(client.id, room.members);
    if (playerIndex === false) return; // !!! TODO Player not found on room list;

    const wasPlayer = !room.members[playerIndex].spectator;

    room.members.splice(playerIndex, 1);
    client.currentRoomKey = null;

    if (rooms[roomIndex].members.length <= 0) { // If there's no players left, delete room:
        rooms.splice(roomIndex, 1);
    } else {
        if (client.id == room.owner && room.members.length > 0) { // If the player was the owner, find a new one:
            let nextOwner = 0;
            while (room.members[nextOwner] == null) {
                nextOwner++
            };
            room.owner = room.members[nextOwner].id
        }

    }
        
    if (wasPlayer) {
        room.inGame = false;
    }

    io.emit('_server_playerLeftRoom', room, client.id, wasPlayer);
}


// Create room function: create a room with 1 or 2 members and return it
function createRoom (rooms, player0, player1, private=false, inGame=false) {
    const newRoom = {
        key:generateRoomKey(rooms),
        members:[{
            id:player0.id, nickname:player0.nickname, spectator:false, // Server data
            victories:0 // Game data
        }],
        owner:player0.id,
        inGame,
        game:{
            state:null
        },
        private,
    };
    player0.currentRoomKey = newRoom.key;
    
    if (player1) {
        newRoom.members.push(
            {
                id:player1.id, nickname:player1.nickname, spectator:false, // Server data
                victories:0 // Game data
            }
        )
        player1.currentRoomKey = newRoom.key;
    }

    rooms.push(newRoom);
    return newRoom;
}

function leaveQueue (client, matchQueue, socket) {
    
    if (!client.onQueue) return false; // Not on queue;

    const queueIndex = matchQueue.indexOf(client.id);
    if (queueIndex < 0) return; // Not found on queue;

    matchQueue.splice(queueIndex, 1);
    client.onQueue = false;

    socket.emit("server_leftQueue");
}
