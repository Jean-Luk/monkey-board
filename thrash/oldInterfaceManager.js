
export default function createInterfaceManager () {

    const info = {
        currentInterface:null,
    }

    function networkUpdate (command, inputManager, socket) {
        const updates = {};

        updates["createdRoom"] = function () {
            const room = command.room
            openGameLobby(inputManager, room, socket);
        }
        updates["joinedRoom"] = function () {
            const room = command.room;
            showPlayerList(inputManager, room);
        }
        updates["leftRoom"] = function () {
            const room = command.room;
            showPlayerList(inputManager, room);            
        }

        if (updates[command.event]) updates[command.event]();

    }

    function openStartMenu (inputManager, roomManager, socket) {
        inputManager.clearInputs();
    
        info.currentInterface = "main_menu";
    
        const mainMenuButtons = {};
    
        mainMenuButtons.nicknameInput = inputManager.createInput("textInput", canvas.width/2-100, canvas.height/2-200, 200, 50, {
            placeholderValue:"Nickname"
        }, "nickname_input")
        
        mainMenuButtons.roomKeyInput = inputManager.createInput("textInput", canvas.width/2-280, canvas.height/2-100, 200, 50, {
            placeholderValue:"Room key",
        }, "room_key_input")
        
        mainMenuButtons.enterRoomButton = inputManager.createInput("button", canvas.width/2-280, canvas.height/2-46, 200, 50, {
            value:"Enter room",
            inputFunction: function () {
                roomManager.enterRoom(socket, mainMenuButtons.nicknameInput.getValue(), mainMenuButtons.roomKeyInput.getValue());
            }

        }, "enter_room_button")
        
        mainMenuButtons.createRoomButton = inputManager.createInput("button", canvas.width/2+80, canvas.height/2 - 72, 200, 50, {
            value:"Create Room",
            inputFunction: function () {
                roomManager.createRoom(socket, mainMenuButtons.nicknameInput.getValue());
            }
        }, "create_room_button")

    }

    function openGameLobby (inputManager, room, socket) {

        inputManager.clearInputs();

        inputManager.createInput("button", canvas.width/2-50, canvas.height-100, 100, 50, {
            inputFunction: function () {
                roomsManager.leaveRoom(socket)
            },
            value:"Leave room"
        }
        )
    
        inputManager.createInput("button", canvas.width/2-50, canvas.height/2, 100, 50, {
            inputFunction: function () {
                roomsManager.startGame(network.socket)
            },
            value:"Start game"
        }
        )

        showPlayerList(inputManager, room);
    }

    function showPlayerList (inputManager, room) {

        const playerList = room.players
        let textPlayerlist = `Player list (${room.key}): \n\n`;

        for(let i in playerList) {
            if (playerList[i].spectator) {
                textPlayerlist += `${playerList[i].nickname}\n`
            } else {
                textPlayerlist += `${playerList[i].nickname}\n`
            }
        }

        inputManager.createInput("textBox", 50, 10, 200, canvas.height-10, {value:textPlayerlist})
    }
    
    return {
        info,
        openStartMenu, openGameLobby, showPlayerList, networkUpdate
    }
}