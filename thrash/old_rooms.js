import createRoomListener from './rooms.js';

(function main () {

    const rooms = createRoomListener();
    
    const socket = io();

    // Receiving ID from socket
    let myID = null;
    socket.on('playerID', (receivedID) => {
        myID = receivedID;

    })
    //
    let currentRoom = null;

    // Buttons:
    const button_create_room = document.getElementById('button_create_room');
    const button_join = document.getElementById('button_join');
    const button_join_spectators = document.getElementById('button_join_spectators');
    const button_join_players = document.getElementById('button_join_players');
    const button_leave_room = document.getElementById('button_leave_room');

    button_create_room.addEventListener('click', () => {
        const nickname = document.getElementById("input_nickname").value;
        if (!nickname) {
            return alert("Invalid nickname.");
        }

        socket.emit('client_createRoom', nickname);
    })
    button_join.addEventListener('click', () => {
        const nickname = document.getElementById("input_nickname").value;
        const roomKey = document.getElementById("input_room_key").value;
        if (!nickname) {
            return alert("Invalid nickname.");
        }
        if (!roomKey) {
            return alert("Invalid room key.");
        }

        socket.emit('client_joinRoom', nickname, roomKey);
    })

    button_join_spectators.addEventListener('click', () => {
        socket.emit('client_joinSpectators');
    })
    button_join_players.addEventListener('click', () => {
        socket.emit('client_joinPlayers');
    })

    button_leave_room.addEventListener('click', () => {
        socket.emit('client_leaveRoom');
    })
    
    socket.on('server_createdRoom', (room) => {
        currentRoom = room;
        showPlayerList(room.players);
        showRoomKey();
        
    });
    
    socket.on('_server_joinedRoom', (room, enteredID) => {
        if (enteredID == myID) {
            currentRoom = room;
        }
        if (room.key != currentRoom.key) return;

        currentRoom = room;

        showPlayerList(room.players);
        showRoomKey(room.key);
    });

    socket.on('_server_playerLeftRoom', (room) => {
        if (room.key != currentRoom.key) return;
        
        currentRoom = room;
        showPlayerList(room.players);
    })

    socket.on('_server_becameSpectator', (room) => {
        if (!(room.key === currentRoom.key)) return;
        showPlayerList(room.players); 
    })
    socket.on('_server_becamePlayer', (room) => {
        if (!(room.key === currentRoom.key)) return;
        showPlayerList(room.players); 
    })

    socket.on('server_askNickname', (playerID, roomKey) => {
        console.log(playerID);
        console.log(myID);
        if (playerID != myID) return;
        let nickname;
        do {
            nickname = prompt("Choose a nickname:")
        } while (nickname === "")

        socket.emit('client_joinRoom', nickname, roomKey);
    })

    function showRoomKey () {
        const span_room_key = document.getElementById('span_room_key');
        span_room_key.display = "block";
        span_room_key.innerHTML = currentRoom.key;
    }
    
    function hideRoomKey () {
        const span_room_key = document.getElementById('span_room_key');
        span_room_key.display = "none";
    }
    
    function showPlayerList (playerList) {
        const span_player_list = document.getElementById('span_player_list');
        const span_spectator_list = document.getElementById('span_spectator_list');
        span_player_list.innerHTML = "";
        span_spectator_list.innerHTML = "";
    
        for(let i in playerList) {
            if (playerList[i].spectator) {
                span_spectator_list.innerHTML += `${playerList[i].nickname}<br />`
            } else {
                span_player_list.innerHTML += `${playerList[i].nickname}<br />`
            }
        }
    }
})()
