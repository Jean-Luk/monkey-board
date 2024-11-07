export default function createRoomManager () {

    function inputUpdate (command, network) {
        
        const socket = network.socket;

        const updates = {}
        updates["buttonCreateRoomClicked"] = function () { 
            createRoom(socket, command.nickname);
        }
        updates["buttonEnterRoomClicked"] = function () {
            enterRoom(socket, command.nickname,  command.roomKey);
        }
        updates["buttonStartGameClicked"] = function () {
            startGame(socket, network.getCurrentRoom);
        }
        updates["buttonLeaveRoomClicked"] = function () {
            leaveRoom(socket);
        }
        updates["buttonFindMatchClicked"] = function () {
            findMatch(socket, command.nickname)
        }
        updates["buttonCancelQueueClicked"] = function () {
            cancelQueue(socket)
        }
        updates["buttonJoinRoomClicked"] = function () {
            // Join room by invite link:
            const path = window.location.pathname;
            if (path.substring(0,5) == "/join") {
                const keyMatch = path.match(/join=(.*)/);
                if (keyMatch && keyMatch[1]) {
                    const roomKey = keyMatch[1];
                    enterRoom(socket, command.nickname, roomKey);
                }
            }
        }
        updates["buttonQuitGameClicked"] = function () {
            const room = network.getCurrentRoom();
            if (room.private) {
                leaveRoom(socket);
            } else {
                backToLobby(socket);
            }
        }

        if (updates[command.event]) {updates[command.event]()};
    }

    function createRoom (socket, nickname) {
        if (!nickname) {
            return alert("Invalid nickname.");
        }

        socket.emit('client_createRoom', nickname);
    }

    function findMatch (socket, nickname) {
        if (!nickname) {
            return alert("Invalid nickname.");
        }

        socket.emit('client_findMatch', nickname);
    }

    function enterRoom (socket, nickname, roomKey) {
        if (!nickname) {
            return alert("Invalid nickname.");
        }
        if (!roomKey) {
            return alert("Invalid room key.");
        }

        socket.emit('client_joinRoom', nickname, roomKey);
    }

    function leaveRoom (socket) {
        socket.emit('client_leaveRoom');
    }

    function cancelQueue (socket) {
        socket.emit('client_cancelQueue');
    }

    function startGame (socket, room) {
        if (room.players < 2) {
            return alert("Must have 2 players on the room");
        }

        socket.emit('client_startGame')
    }

    function backToLobby (socket) {
        socket.emit("client_backToLobby")
    }

    return {
        createRoom, enterRoom, leaveRoom, startGame, inputUpdate
    }
}