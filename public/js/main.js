import createMouseListener from "./mouseListener.js";
import createState from "./game.js";
import requestDraw from "./draw.js";
import createNetwork from "./network.js";
import createKeyboardListener from "./keyboardListener.js";
import createRoomManager from "./roomManager.js";
import createInterfaceManager from "./interfaceManager.js";

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const mainInfo = {
    inGame: false,
}

const mouseListener = createMouseListener();
const keyboardListener = createKeyboardListener();

const game = createState(canvas);
const drawManager = requestDraw();

const network = createNetwork();
const interfaceManager = createInterfaceManager()
const roomManager = createRoomManager();


network.subscribe((command) => {
    if (command.event == "gameStarted") {
        mainInfo.inGame = true;
        mouseListener.subscribe(game.gameClick);

    }
    interfaceManager.networkUpdate(command)
    game.networkUpdate(command);
    drawManager.networkUpdate(command);

});

game.subscribe((command) => {
    network.gameUpdate(command);
    interfaceManager.gameUpdate(command);
})

interfaceManager.subscribe((command) => {
    if (command.event == "buttonQuitGameClicked") {
        mainInfo.inGame = false;
        mouseListener.unsubscribe(game.gameClick)
    }

    roomManager.inputUpdate(command, network);
})

drawManager.draw(ctx, mainInfo, game.getGameInfo(), canvas);

const path = window.location.pathname;
interfaceManager.closeAllMenus();
interfaceManager.openMainMenu();

// Join room by invite link:
if (path.substring(0,5) == "/join") {
    const keyMatch = path.match(/join=(.*)/);

    if (keyMatch && keyMatch[1]) {
        interfaceManager.openNicknameMenu(keyMatch[1]);
    }
}
