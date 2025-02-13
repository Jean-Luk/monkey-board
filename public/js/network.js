
export default function createNetwork () {
    const socket = io();

    const status = {
        myId:null, currentRoom:{}
    }

    const observers = [];

    function subscribe (observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll (command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function gameUpdate (command) {
        const updates = {};

        updates["executeAction"] = function (command) {
            socket.emit("client_executeAction", command);
        }

        if (updates[command.event]) updates[command.event](command);
    }

    function interfaceUpdate (command) {
        const updates = {};

        updates["buttonWatchMatchClicked"] = function (command) {
            socket.emit("client_watch_match");
        }

        if (updates[command.event]) updates[command.event](command);
    }
    function getCurrentRoom () {
        return status.currentRoom;
    }
    
    socket.on('playerId', (receivedId) => {
        status.myId = receivedId;

        notifyAll({event:"receivedPlayerId", receivedId});        
    });

    socket.on('server_createdRoom', (room) => {
        status.currentRoom = room;

        notifyAll({event:"createdRoom", room, myId:status.myId})
    });

    socket.on('server_enteredQueue', (nickname) => {
        notifyAll({event:"enteredQueue", nickname});
    });

    socket.on('server_leftQueue', () => {
        notifyAll({event:"leftQueue"});
    });

    socket.on('_server_joinedRoom', (room, enteredId) => {
        if (enteredId == status.myId) {
            status.currentRoom = room;
        }

        if ((status.currentRoom) && (room.key != status.currentRoom.key)) return;

        status.currentRoom = room;

        if (enteredId == status.myId) { // You joined a room
            notifyAll({event:"joinedRoom", room, socket, myId:status.myId});
        } else { // Someone joined your current room
            notifyAll({event:"newPlayerJoinedRoom", room, socket, myId:status.myId});
        }
    });

    socket.on('_server_createdMatch', (room, players) => { // Started match from queue
        if (!(players.includes(status.myId))) return;
        status.currentRoom = room;

        const myIndex = room.state.players[0].id == status.myId ? 0 : 1;

        notifyAll({event:"gameStarted", state:room.state, players:room.members, myIndex})
    });

    socket.on('_server_playerLeftRoom', (room, playerId, wasPlayer) => {
        if (room.key != status.currentRoom.key) return;
        
        status.currentRoom = room;

        if (playerId == status.myId) { // You left the current room
            notifyAll({event:"leftRoom", room})
        } else { // Someone left your current room
            notifyAll({event:"playerLeftRoom", room, myId:status.myId, wasPlayer})
        }

    })

    socket.on('_server_gameStarted', (room) => { // Game on current room started
        if (status.currentRoom && room.key != status.currentRoom.key) return;

        status.currentRoom = room;
        const myIndex = room.state.players[0].id == status.myId ? 0 : 1;
        let isSpectator = false;

        if (room.state.players[0].id != status.myId && room.state.players[1].id != status.myId) {
            isSpectator = true;            
        }
        
        notifyAll({event:"gameStarted", state:room.state, players:room.members, myIndex, isSpectator})
    })

    socket.on('server_playerWatchingMatch', (room) => {
        status.currentRoom = room;
        const myIndex = 1;
        let isSpectator = true;

        notifyAll({event:"gameStarted", state:room.state, players:room.members, myIndex, isSpectator})

    })

    socket.on('_server_playerExecutedAction', (room) => {
        if (status.currentRoom && room.key != status.currentRoom.key) return;

        notifyAll({event:"playerExecutedAction", state:room.state});
    })

    socket.on('_server_playerWonGame', (room) => {
        if (status.currentRoom && room.key != status.currentRoom.key) return;
        
        const command = {event:"playerWonGame", state:room.state, winner:room.state.winner, players:room.members}

        notifyAll(command);
        notifyAll({event:"gameEnded"});
    })

    socket.on("server_error_joinRoom", (error) => {
        const command = {event:"errorJoiningRoom", error}
        notifyAll(command);
    })

    socket.on("server_wentBackToLobby", (room) => {
        notifyAll({event:"joinedRoom", room, myId:status.myId});
    })

    socket.on("server_error_startGame", (message) => {
        notifyAll({event:"errorStartingGame", message});
    })

    return {
        getCurrentRoom, subscribe,
        gameUpdate, interfaceUpdate,
        socket,
    }
}

