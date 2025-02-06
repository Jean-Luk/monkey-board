export default function createState (canvas) {

    let boardMarginX;
    let boardMarginY;
    
    const observers = [];

    function subscribe (observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll (command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    const objects = [
        {
            name:'King', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'black'
                ctx.fillText("King", x-5, y-4);
                ctx.fillStyle = 'yellow'
                ctx.fillText("King", x-4, y-5);
                ctx.fillRect(x, y, 25, 25);
            },
            movable:true,
            killable:true,
            action:moveObject,
        },
        {
            name:'Archer', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'black'
                ctx.fillText("Archer", x-11, y-4);
                ctx.fillStyle = 'green';
                ctx.fillRect(x, y, 25, 25);
                ctx.fillText("Archer", x-10, y-5);
            },
            movable:true,
            killable:true,
            action:moveOrKillObject,
        },
        {
            name:'Guard', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'black'
                ctx.fillText("Guard", x-11, y-4);
                ctx.fillStyle = 'brown';
                ctx.fillText("Guard", x-10, y-5);
                ctx.fillRect(x, y, 25, 25);
            },
            movable:true,
            killable:false,
            action:moveObject
        },
        {
            name:'Warrior', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'black'
                ctx.fillText("Warrior", x-15, y-4);
                ctx.fillStyle = 'red';
                ctx.fillText("Warrior", x-14, y-5);
                ctx.fillRect(x, y, 25, 25);
            },
            movable:true,
            killable:true,
            action:moveObjectAndKill
        }
    ]

    const localState = {
        selectedTile:{
            y:null, x:null
        },
        selectedCardIndex: null,
        possibleMoves: [],
        playerIndex:null // TODO: identify what is my index based on the state received from the server
    }

    const state = {
    }
        
    function networkUpdate (command) {
        const updates = {};

        updates["gameStarted"] = function (command) {
            resetState("online", command.state);
        }
        updates["playerExecutedAction"] = function (command) {
            updateState(command.state);
        }
        updates["playerWonGame"] = function (command) {
            updateState(command.state);
        }
        updates["playerLeftRoom"] = function (command) {
            if (command.wasPlayer && command.room.inGame) {
                notifyAll({event:"opponentLeft"})
            }

        }
        if (updates[command.event]) updates[command.event](command);
    }
    
    function updateState (newState) {
        localState.selectedTile = {
            y:null, x:null
        };
        localState.selectedCardIndex= null;
        localState.possibleMoves= [];

        for (let key in newState) {
            state[key] = newState[key]
        }

    }

    function resetState (gameType, newState=null) {
        boardMarginX = canvas.width/2 - (newState.board.width*newState.board.tileSize) / 2
        boardMarginY = canvas.height/2 - (newState.board.height*newState.board.tileSize) / 2

        localState.playerIndex=newState.myIndex

        if (gameType === "online") {
            updateState(newState);
        }
        if (gameType === "local") {
            

        }

    }
    
    function checkIfClickedOnPossibleAction (clickedTile) {
        // Whenever clicks on a tile, check if it contains a possible action
        for(let tile of localState.possibleMoves) {
            if(clickedTile.x === tile.x && clickedTile.y === tile.y) {
                return true;
            }
        }
        return false;
    }

    function gameClick ( command ) {
        // Verify if clicked in any element that belongs to the game

        const xClick = command.x;
        const yClick = command.y;

        if ((xClick>boardMarginX && xClick<boardMarginX+state.board.width*state.board.tileSize) && (yClick>boardMarginY && yClick<boardMarginY+state.board.height*state.board.tileSize)) {
            // If clicked inside the board:
            boardClick(xClick, yClick);

        } else {
            // If clicked anywhere else:
            offBoardClick(xClick, yClick);

        }

    }

    function boardClick ( xClick, yClick ) {
        const newSelectedTile={
            x: Math.floor((xClick-boardMarginX)/state.board.tileSize),
            y: Math.floor((yClick-boardMarginY)/state.board.tileSize)
        }

        if (localState.playerIndex == 0) {
            newSelectedTile.x = (state.board.width-1) - newSelectedTile.x;
            newSelectedTile.y = (state.board.height-1) - newSelectedTile.y;
        }
        
        const clickedOnPossibleAction = checkIfClickedOnPossibleAction(newSelectedTile);

        if (clickedOnPossibleAction) {
            executeAction(newSelectedTile)
            return;
        }

        // If clicked in the current selected tile, deselect it.
        if(newSelectedTile.x === localState.selectedTile.x && newSelectedTile.y === localState.selectedTile.y) {
            localState.selectedTile.x=null;
            localState.selectedTile.y=null;

        } else {
            localState.selectedTile = newSelectedTile;

        }


        updatePossibleMoves();
    }

    function offBoardClick ( xClick, yClick ) {
        
        // Check if clicked in a card
        const cards = state.players[localState.playerIndex].cards

        // const baseX = boardMarginX + (cardIndex * spaceBetweenCards) +  spaceBetweenCards/2 - 25;
        // const baseY = playerIndex == myIndex ? (boardMarginY + board.height*board.tileSize + 42 ) : boardMarginY - 92;

        const spaceBetweenCards = state.board.width*state.board.tileSize/(cards.length)

        for (let cardIndex in cards) {
            if (xClick > boardMarginX + spaceBetweenCards/2 - 25 + (cardIndex*spaceBetweenCards) && xClick < boardMarginX + spaceBetweenCards/2 + 25 + (cardIndex*spaceBetweenCards)) {
                if (yClick > boardMarginY + state.board.height*state.board.tileSize + 42  && yClick < boardMarginY + state.board.height*state.board.tileSize + 92) {
                    if (localState.selectedCardIndex == cardIndex) {
                        localState.selectedCardIndex = null;

                    } else {
                        localState.selectedCardIndex = cardIndex;

                    }

                    updatePossibleMoves();
                    break;
                }
            }
        }

    }

    function executeAction (coords) {
        const objectTile = state.board.tiles[localState.selectedTile.y][localState.selectedTile.x];
        const objectId = objectTile.object.id

        if (state.currentPlayer != localState.playerIndex) { // Verify if its my turn;
            return;
        }

        if (objectTile.object.team != localState.playerIndex) { // Verify if the object from the selected tile is from my team
            return;
        }
        
        const command = {objectTile, coords}
        const action = objects[objectId].action(command)
    
        if (!action) { // If the object has no action, cancel;
            return;
        }

        notifyAll({event:"executeAction", localState, targetCoords:coords})
    }

    function moveObject (command) {
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]

        if (targetTile.occupied) return false;
    
        return true;
    }
    
    function moveObjectAndKill (command) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]
        
        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        }

        return true;
    }
    
    function moveOrKillObject (command) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]

        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        }
        
        return true;
    }
    
    function updatePossibleMoves () { 
        localState.possibleMoves = []
    
        if(localState.selectedTile.x === null || localState.selectedTile.y === null) return;
        if(!(localState.selectedCardIndex)) return;

        const currentTile = state.board.tiles[localState.selectedTile.y][localState.selectedTile.x]
        const currentCard = state.allCards[state.players[localState.playerIndex].cards[localState.selectedCardIndex]]
    
        if (currentTile.occupied && objects[currentTile.object.id].movable) {
            for(const moveIndex in currentCard) {

                let newMove;
                
                // Invert the coordinates
                const factor = currentTile.object.team == 1 ? 1 : -1;

                newMove = {
                    x: localState.selectedTile.x + factor * currentCard[moveIndex][0], 
                    y: localState.selectedTile.y + factor * currentCard[moveIndex][1]
                };
                
                // Check if the move is inside the board
                if(!(newMove.x >= state.board.width || newMove.x < 0)) {
                    if(!(newMove.y >= state.board.height || newMove.y < 0)) {
                        localState.possibleMoves.push(newMove);
                    }
                }
                
            }
        }
    }
    

    return {
        subscribe,
        objects, localState, state,
        networkUpdate, gameClick,
    }
}