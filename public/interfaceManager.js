
export default function createInterfaceManager () {

    const info = {
        currentInterface:null,
    }

    const menus = document.getElementById('menus');
    const allMenus = menus.getElementsByTagName('div');
    
    const allInputs = document.getElementsByTagName('input');
    const allSpans = document.getElementsByTagName('span');

    function closeAllMenus () {
        Array.from(allMenus).forEach(menu => {
            menu.style.display = 'none';
        });
    }


    function findInputsByClass (className) {
        const inputsArray = [];
        for (let input of allInputs) {
            if (input.className == className) {
                inputsArray.push(input);
            }
        }
        return inputsArray;
    }

    function findInputById (id) {
        for (let input of allInputs) {
            if (input.id == id) {
                return input;
            }
        }
    }

    function findSpanById (id) {
        for (let span of allSpans) {
            if (span.id == id) {
                return span;
            }
        }
    }
    function findMenuById (id) {
        for (let menu of allMenus) {
            if (menu.id == id) {
                return menu;
            }
        }
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

    // NICKNAME MENU -----
    findInputById("button_join_room_nickname_menu").addEventListener("click", () => {
        const nickname = findInputById("input_nickname_nickname_menu").value
        if(!nickname) {
            return alert("Invalid nickname.");
        }

        const command = {
            event:"buttonJoinRoomClicked",
            nickname
        }

        notifyAll(command)
    })

    // MAIN MENU ------

    findInputById("button_private_room").addEventListener("click", () => {
        const nickname = findInputById("input_nickname_main_menu").value
        if (!nickname) {
            return alert("Invalid nickname.");
        }

        openPrivateRoomMenu();
    })

    findInputById("button_find_match").addEventListener("click", () => {
        const command = {
            event: "buttonFindMatchClicked",
            nickname: findInputById("input_nickname_main_menu").value,
        }
        notifyAll(command);
    })

    // PRIVATE ROOM MENU ------

    findInputById("button_create_room").addEventListener("click", () => {
        const command = {
            event: "buttonCreateRoomClicked", 
            nickname: findInputById("input_nickname_main_menu").value
        }
        notifyAll(command);
    })
    
    findInputById("button_enter_room").addEventListener("click", () => {
        const command = {
            event: "buttonEnterRoomClicked", 
            nickname: findInputById("input_nickname_main_menu").value,
            roomKey: findInputById("input_room_key").value
        }
        notifyAll(command);
    })
    
    // GAME LOBBY ------

    findInputById("button_start_game").addEventListener("click", () => {
        const command = {
            event: "buttonStartGameClicked",
        }
        notifyAll(command);
    })
    findInputById("button_leave_room").addEventListener("click", () => {
        const command = {
            event: "buttonLeaveRoomClicked",
        }
        notifyAll(command);
    })
    findInputById("button_copy_room_key").addEventListener("click", () => {
        const roomKey = findSpanById("room-key").innerHTML
        copyText(roomKey)
    })
    findInputById("button_copy_room_invite_link").addEventListener("click", () => {
        const roomKey = findSpanById("room-key").innerHTML;
        const url = `${window.location.origin}/join=${roomKey}`;
        copyText(`${url}`);
    })

    // QUEUE SCREEN ------

    findInputById("button_cancel_queue").addEventListener("click", () => {
        const command = {
            event:"buttonCancelQueueClicked",
        }
        notifyAll(command)
    })

    // IN GAME -----

    findInputsByClass("buttons_quit_match").forEach((input) => {
        input.addEventListener("click", () => {
            const command = {
                event:"buttonQuitGameClicked"
            }
        notifyAll(command);
        }
    )})

    // OTHERS ------
    
    findInputsByClass("buttons_back_to_main_menu").forEach((input) => {
        input.addEventListener("click", () => {
        openMainMenu();
    })})

    // UPDATES ------
    
    function gameUpdate (command) {

        const updates = {};

        updates["opponentLeft"] = function () {
            document.getElementById("menus").style.display = 'flex';
            showOpponentLeftScreen();
        }

        if (updates[command.event]) updates[command.event](command);
    }

    function networkUpdate (command) {
        const updates = {};

        updates["createdRoom"] = function () {
            openGameLobby(command.room, command.myId);
        }
        updates["joinedRoom"] = function () {
            openGameLobby(command.room, command.myId);
        }
        updates["newPlayerJoinedRoom"] = function () {
            updatePlayerList(command.room, command.myId);
        }
        updates["leftRoom"] = function () {
            closeAllMenus();
            openMainMenu();
        }
        updates["leftQueue"] = function () {
            closeAllMenus();
            openMainMenu();
        }
        updates["playerLeftRoom"] = function () {
            updatePlayerList(command.room, command.myId);
        }
        updates["gameStarted"] = function () {
            closeAllMenus();
            document.getElementById("menus").style.display = 'none';
        }
        updates["enteredQueue"] = function (command) {
            openSearchingMatchScreen(command.nickname);
        }
        updates["errorJoiningRoom"] = function (command) {
            if(command.error == "Room not found.") {
                findInputById("input_room_key").value = "";
                if(info.currentInterface == "nickname-menu") {
                    openMainMenu();
                }
            }
        }
        updates["gameEnded"] = function () {
            document.getElementById("menus").style.display = 'flex';
        }
        updates["playerWonGame"] = function (command) {
            const winner = command.winner
            const players = command.players
            showEndGameScreen(winner, players)
        }
        updates["backToLobby"] = function (command) {
            openGameLobby(command.room, command.myId);
        }

        if (updates[command.event]) updates[command.event](command);

    }

    function openNicknameMenu (roomKey) {
        closeAllMenus();

        findSpanById("span_room_key_nickname_menu").innerHTML = roomKey

        findMenuById('nickname-menu').style.display = 'block';
        findInputById("input_nickname_nickname_menu").focus();

        info.currentInterface = "nickname-menu";
    }

    function openMainMenu () {
        closeAllMenus();

        findMenuById('main-menu').style.display = 'block';
        findInputById("input_nickname_main_menu").focus();

        info.currentInterface = "main-menu";
    }

    function openPrivateRoomMenu () {
        closeAllMenus();

        findSpanById('span_nickname_private_room_menu').innerHTML = findInputById("input_nickname_main_menu").value;

        findMenuById('private-room-menu').style.display = 'block';
        findInputById("input_room_key").focus();

        info.currentInterface = "private-room-menu";
    }

    function openSearchingMatchScreen (nickname) {
        closeAllMenus()
        
        findSpanById("span_nickname_finding_match").innerHTML = nickname;

        findMenuById("finding-match-screen").style.display = 'block';
        info.currentInterface = "finding-match-screen";
    }

    function openGameLobby (room, myId) {
        closeAllMenus();

        findSpanById('room-key').innerHTML = room.key;        
        updatePlayerList(room, myId);

        findMenuById('game-lobby').style.display = 'block';
        info.currentInterface = "game-lobby";

        if (myId == room.owner) {
            findInputById("button_start_game").style.display = ''
        } else {
            findInputById("button_start_game").style.display = 'none'
        }
    }

    function showEndGameScreen (winner, players) {
        closeAllMenus();

        findSpanById('winner-end-screen').innerHTML = players[winner].nickname;
        findMenuById('end-game-screen').style.display = "block";

        info.currentInterface = "end-game";
    }

    function showOpponentLeftScreen () {
        closeAllMenus();

        findMenuById('opponent-left-game-screen').style.display = "block";

        info.currentInterface = "opponent-left-end-game";
    }
    
    function updatePlayerList (room, myId) {
        let playerListText = "";
        let spectatorListText = "";

        for (const player of room.players) {
            const playerText = player.id == myId ? `<b>${player.nickname}</b><br/>` : `${player.nickname}<br />`;
            if (player.spectator) {
                spectatorListText += playerText;
            } else {
                playerListText += playerText;
            }
        }

        findSpanById('player-list').innerHTML = playerListText;
        // findSpanById('spectator-list').innerHTML = spectatorListText;
    }

    function copyText (text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
    }
    
    return {
        info, subscribe,
        closeAllMenus, openMainMenu, openGameLobby, openNicknameMenu,
        updatePlayerList, networkUpdate, gameUpdate 
    }
}