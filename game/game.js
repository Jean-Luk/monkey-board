const defaultConfig = {
    cardsPerPlayer:4,
    boardHeight:6, boardWidth:7, boardTileSize: 64,
    initialObjects:[3, 2, 1, 0, 1, 2, 3]
}

const objects = require("./objects.js");
const allCards = require("./cards.js");

function createNewGame (config, playersIds, playersNicknames) {
    config = config ? config : defaultConfig;

    const state = {
        players: [
            {cards:[], cardQueuePosition:0, cardQueue: createCardQueue(config), souls:0, id:playersIds[0], nickname:playersNicknames[0]},
            {cards:[], cardQueuePosition:0, cardQueue: createCardQueue(config), souls:0, id:playersIds[1], nickname:playersNicknames[1]}
        ],
        winner:null,
        currentPlayer:0,
        board: createBoard(config),
        allCards,
        config
    }

    drawCards(state, config);

    return state;

}

function createCardQueue (config) {
    // Insert the first cards on the queue;
    const newCardQueue = [];

    for (let i=0; i < config.cardsPerPlayer+1; i++) {
        const nextCard = Math.floor(Math.random() * allCards.length)
        newCardQueue.push(nextCard);

    }

    return newCardQueue
}

function drawCards (state, config) {
    for (let i=0; i<state.players.length; i++) {
        for (let j=0; j<config.cardsPerPlayer; j++) {
            state.players[i].cards.push(state.players[i].cardQueue[j]);
        }
        state.players[i].cardQueuePosition = config.cardsPerPlayer;
    }
}

function giveCard (state, cardIndex) {
    // Give the last card of the queue, then add a new one; 
    const playerIndex = state.currentPlayer;

    const cardQueuePosition = state.players[playerIndex].cardQueuePosition;
    
    state.players[playerIndex].cards[cardIndex] = state.players[playerIndex].cardQueue[cardQueuePosition]

    state.players[playerIndex].cardQueue[cardQueuePosition+1] = Math.floor(Math.random() * allCards.length);
    state.players[playerIndex].cardQueuePosition++

}

function createBoard (config) {
    // Create an empty board and add the initial troops.
    
    const boardHeight = config.boardHeight;
    const boardWidth = config.boardWidth;
    
    const newBoard = {tiles:[], height:boardHeight, width:boardWidth, tileSize:config.boardTileSize};

    for(let y=0; y<boardHeight; y++) {
        newBoard.tiles[y]=[]
        for (let x=0; x<boardWidth; x++) {
            newBoard.tiles[y][x] = {occupied:false, object:null}
        }
    }
    initialObjects = config.initialObjects;
    for (let i=0; i<=1; i++) {
        for (let j=0; j < initialObjects.length || j < boardWidth; j++) {
            newBoard.tiles[i * (boardHeight-1)][j] = { 
                occupied:true,
                object:{id:initialObjects[j], team:i }
            };
        }
    }

    return newBoard;
}

function executeAction (state, playerId, command) {
    const playerIndex = state.players[0].id == playerId ? 0 : 1;
    const localState = command.localState;
    const targetCoords = command.targetCoords;
    
    const selectedCard = allCards[state.players[playerIndex].cards[localState.selectedCardIndex]];
    const selectedTileCoords = localState.selectedTile;
    const selectedTile = state.board.tiles[selectedTileCoords.y][selectedTileCoords.x];
    
    // Catchers | TODO: Send warnings
    if (playerIndex != state.currentPlayer) return;

    if (selectedTile.object.team != playerIndex) return;

    let corresponded = false;
    
    for(const moveIndex in selectedCard) {
        let expectedCoordinates = {x:null, y:null};
        
        // Invert the coordinates if it's from the top team
        const factor = selectedTile.object.team === 0 ? -1 : 1;
        
        expectedCoordinates.x = selectedTileCoords.x + factor * selectedCard[moveIndex][0];
        expectedCoordinates.y = selectedTileCoords.y + factor * selectedCard[moveIndex][1];
        
        if (expectedCoordinates.x === targetCoords.x && expectedCoordinates.y === targetCoords.y) {
            corresponded = true;
            break;
        }
    }
    
    if (!corresponded) return // None of the moves of the card matches with the target coords
    // End of catchers;
    
    const success = objects[selectedTile.object.id].action(state, selectedTileCoords, targetCoords, objects);
    
    if (!success) return;

    actionPerformed(state, localState);
}


function actionPerformed (state, localState) {

    giveCard(state, localState.selectedCardIndex)

    state.currentPlayer = state.currentPlayer == 0 ? 1 : 0;

    
}

// Check if its a draw or if a king has been killed

module.exports = {
    createNewGame, executeAction
}
