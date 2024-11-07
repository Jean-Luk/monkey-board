
export default function createNetwork () {
    const socket = io();

    const status = {
        myId:null, currentRoom:{gameStatus:null}
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
        if (command.event === "executeAction") {
            socket.emit("client_executeAction", command);
        }
    }

    function inputUpdate (command, room) {
        if (command.event === "joinRoom") {
            const roomKey = command.key
        }
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

    socket.on('_server_createdMatch', (room, players) => {
        if (!(players.includes(status.myId))) return;
        status.currentRoom = room;

        room.game.state.myIndex = room.game.state.players[0].id == status.myId ? 0 : 1;
        notifyAll({event:"gameStarted", state:room.game.state, players:room.players})
    });

    socket.on('_server_playerLeftRoom', (room, playerId) => {
        if (room.key != status.currentRoom.key) return;
        
        status.currentRoom = room;

        if (playerId == status.myId) { // You left the current room
            notifyAll({event:"leftRoom", room})
        } else { // Someone left your current room
            notifyAll({event:"playerLeftRoom", room, myId:status.myId})
        }

    })

    socket.on('_server_gameStarted', (room) => {
        if (status.currentRoom && room.key != status.currentRoom.key) return;

        status.currentRoom = room;

        room.game.state.myIndex = room.game.state.players[0].id == status.myId ? 0 : 1;
        notifyAll({event:"gameStarted", state:room.game.state, players:room.players})
    })

    socket.on('_server_playerExecutedAction', (room) => {
        if (status.currentRoom && room.key != status.currentRoom.key) return;

        notifyAll({event:"playerExecutedAction", state:room.game.state});
    })
    socket.on('_server_playerWonGame', (room) => {
        if (status.currentRoom && room.key != status.currentRoom.key) return;
        
        const command = {event:"playerWonGame", state:room.game.state, winner:room.game.state.winner, players:room.players}

        notifyAll(command);
        notifyAll({event:"gameEnded"});
    })

    socket.on("server_error_joinRoom", (error) => {
        alert(error);

        const command = {event:"errorJoiningRoom", error}
        notifyAll(command);
    })

    socket.on("server_wentBackToLobby", (room) => {
        notifyAll({event:"joinedRoom", room, myId:status.myId});
    })
    return {
        inputUpdate, getCurrentRoom, gameUpdate,
        status, socket, subscribe,
    }
}

