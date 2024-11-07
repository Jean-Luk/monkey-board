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

    button_join_spectators.addEventListener('click', () => {
        socket.emit('client_joinSpectators');
    })
    button_join_players.addEventListener('click', () => {
        socket.emit('client_joinPlayers');
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
