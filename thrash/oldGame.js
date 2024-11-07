export default function createState () {

    const board = {
        width:7, height:7,
        tileSize:50,
        tiles:[]
        
    }
    board.margin = {
        x: canvas.width/2 - (board.width*board.tileSize) / 2,
        y: canvas.height/2 - (board.height*board.tileSize) / 2
    }

    const objects = [
        {
            name:'King', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
            },
            movable:true,
            killable:true,
            action:moveObject,
        },
        {
            name:'Archer', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'green';
                ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
            },
            movable:true,
            killable:true,
            action:killObject,
        },
        {
            name:'Guard', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'brown';
                ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
            },
            movable:true,
            killable:false,
            action:moveObject
        },
        {
            name:'Warrior', 
            draw:function(ctx,x,y) {
                ctx.fillStyle = 'red';
                ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
            },
            movable:true,
            killable:true,
            action:moveObjectAndKill
        }
    ]

    
    const state = {
        config: {
            cardsPerPlayer: 3,
            gameType: 'local' // Local, Online
        },

        network: {
            roomId:1,
        },

        selectedTile:{
            y:null, x:null
        },
        players:[
            {cards:[], cardQueuePosition:0},
            {cards:[], cardQueuePosition:0}
        ], 
        currentPlayer: 0, // Who is the next to play
        selectedCard: null,
        possibleMoves: [],
    }
    
    const allCards = [
        [[-1,-1], [1,1]], 
        [[1,1], [-1,-1], [1, -1], [-1, 1]], 
        [[0,-1], [0,-2]], 
        [[1,-1], [-1,-1]],
        [[1,-2], [-1,-2]],
        [[1, 0], [-1, 0], [0, 1], [0, -1]],
        [[2, 0], [-2, 0]],
    ]

    const cardQueue = []
    
    function networkUpdate (command) {
        const updates = {};

        updates["gameStarted"] = function () {
            resetState('online');
        }
        
        if (updates[command.event]) updates[command.event]();
    }

    function resetBoard () {
        // Clear all the objects on the board and add the initial troops.
        for(let y=0; y<board.height; y++) {
            board.tiles[y]=[]
            for (let x=0; x<board.width; x++) {
                board.tiles[y][x] = {occupied:false, object:null}
            }
        }
        for (let i=0; i<=1; i++) { /// !!!! otimizar?
            board.tiles[i*(board.height-1)][0] = {occupied:true, object:{id:3, team:i}}
            board.tiles[i*(board.height-1)][1] = {occupied:true, object:{id:2, team:i}}
            board.tiles[i*(board.height-1)][2] = {occupied:true, object:{id:1, team:i}}
            board.tiles[i*(board.height-1)][3] = {occupied:true, object:{id:0, team:i}}
            board.tiles[i*(board.height-1)][4] = {occupied:true, object:{id:1, team:i}}
            board.tiles[i*(board.height-1)][5] = {occupied:true, object:{id:2, team:i}}
            board.tiles[i*(board.height-1)][6] = {occupied:true, object:{id:3, team:i}}
        }
    }    
    
    function drawCards () {
        // Insert the first cards on the queue and give them to both players, them change their card queue position;
        for (let i=0; i < state.config.cardsPerPlayer+1; i++) {
            const nextCard = Math.floor(Math.random() * allCards.length)
            cardQueue.push(nextCard);

            if (i < state.config.cardsPerPlayer) {
                state.players[0].cards[i] = cardQueue[i]
                state.players[1].cards[i] = cardQueue[i]
            }
        }

        state.players[0].cardQueuePosition = state.config.cardsPerPlayer;
        state.players[1].cardQueuePosition = state.config.cardsPerPlayer;

    }

    function giveCard (playerIndex, cardIndex) {
        // Check if the queue has enough cards; If not, add one; Then give the card to the specified player and update their position in the queue;
        const cardQueuePosition = state.players[playerIndex].cardQueuePosition

        if (!cardQueue[cardQueuePosition+1]) {
            cardQueue[cardQueuePosition+1] = Math.floor(Math.random() * allCards.length);
        }

        state.players[playerIndex].cards[cardIndex] = cardQueue[cardQueuePosition]
        state.players[playerIndex].cardQueuePosition++

    }

    function resetState (gameType) {

        state.config.gameType = gameType;

        resetBoard();
        
        if (gameType === "local") {
            drawCards();
        }

    }
    
    function checkIfClickedOnPossibleAction (clickedTile) {
        // When click on a tile, check if it contains a possible action
        for(let tile of state.possibleMoves) {
            if(clickedTile.x === tile.x && clickedTile.y === tile.y) {
                return(clickedTile);
            }
        }
        return false
    }

    function gameClick ( command ) {
        // Verify if clicked in any element that belongs to the game

        const xClick = command.x;
        const yClick = command.y;

        if ((xClick>board.margin.x && xClick<board.margin.x+board.width*board.tileSize) && (yClick>board.margin.y && yClick<board.margin.y+board.height*board.tileSize)) {
            // If clicked inside the board:
            boardClick(xClick, yClick);

        } else {
            // If clicked anywhere else:
            offBoardClick(xClick, yClick);

        }

    }

    function boardClick ( xClick, yClick ) {
        const newSelectedTile={
            x: Math.floor((xClick-board.margin.x)/board.tileSize),
            y: Math.floor((yClick-board.margin.y)/board.tileSize)
        }

        const clickedOnPossibleAction = checkIfClickedOnPossibleAction(newSelectedTile);

        if (clickedOnPossibleAction) {
            executeAction(newSelectedTile)
            return;
        }

        // If clicked in the current selected tile, deselect it.
        if(newSelectedTile.x === state.selectedTile.x && newSelectedTile.y === state.selectedTile.y) {
            state.selectedTile.x=null;
            state.selectedTile.y=null;

        } else {
            state.selectedTile = newSelectedTile;

        }


        updatePossibleMoves();
    }

    function offBoardClick ( xClick, yClick ) {
        
        // Check if clicked in a card
        const cards = state.players[state.currentPlayer].cards

        for (let cardIndex in cards) {
            if (xClick > canvas.width/2+(120*(cardIndex-1))-25 && xClick < canvas.width/2+(120*(cardIndex-1))-25 + 50) {
                if (yClick > state.currentPlayer*(canvas.height-160)+80 && yClick < state.currentPlayer*(canvas.height-160)+130) {
    
                    if (state.selectedCard == cardIndex) {
                        state.selectedCard = null;

                    } else {
                        state.selectedCard = cardIndex;

                    }

                    updatePossibleMoves();
                    break;

                }
            }
        }
    }

    function executeAction (coords) {
        const objectTile = board.tiles[state.selectedTile.y][state.selectedTile.x];
        const objectId = objectTile.object.id

        if (!(objectTile.object.team === state.currentPlayer)) {
            return;
        }

        const command = {objectTile, coords}
        const action = objects[objectId].action(command)
    
        if (!action) {
            return;
        }

        if (state.config.gameType === "local") {

            state.selectedTile.x=null;
            state.selectedTile.y=null;
        
            giveCard(state.currentPlayer, state.selectedCard)
    
            state.currentPlayer = state.currentPlayer == 0 ? 1 : 0;
            state.selectedCard = null;
    
            updatePossibleMoves();
        } else if (state.config.gameType === "online") {
            
        }

        
    }
    
    function moveObject (command) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = board.tiles[coords.y][coords.x]

        if (targetTile.occupied) return false;
    
        board.tiles[coords.y][coords.x] = { ...objectTile }
        board.tiles[state.selectedTile.y][state.selectedTile.x] = {occupied:false, object:null}

        return true;
    }
    
    function moveObjectAndKill (command) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = board.tiles[coords.y][coords.x]
        
        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        }

        board.tiles[coords.y][coords.x] = { ...objectTile }
        board.tiles[state.selectedTile.y][state.selectedTile.x] = {occupied:false, object:null}

        return true;
    }
    
    function killObject (command) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = board.tiles[coords.y][coords.x]

        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        } else {
            return false;
        }

        board.tiles[coords.y][coords.x] = {occupied:false, object:null}

        return true;
    }
    
    function updatePossibleMoves () {
        state.possibleMoves = []
    
        if(state.selectedTile.x === null || state.selectedTile.y === null) return;
        if(!(state.selectedCard)) return;

        const currentTile = board.tiles[state.selectedTile.y][state.selectedTile.x]
        const currentCard = allCards[state.players[state.currentPlayer].cards[state.selectedCard]]
    
        if (currentTile.occupied && objects[currentTile.object.id].movable) {
            for(const moveIndex in currentCard) {
                // Invert the coordinates if it's from the top team

                let newMove;

                if (currentTile.object.team===0) {
                    newMove = {
                        x: state.selectedTile.x-currentCard[moveIndex][0], 
                        y: state.selectedTile.y-currentCard[moveIndex][1]
                    };
    
                } else {
                    newMove = {
                        x: state.selectedTile.x+currentCard[moveIndex][0], 
                        y: state.selectedTile.y+currentCard[moveIndex][1]
                    };                    

                }

                // Check if the move is off-board
                if(!(newMove.x >= board.width || newMove.x < 0)) {
                    if(!(newMove.y >= board.height || newMove.y < 0)) {
                        state.possibleMoves.push(newMove);
                    }
                }
                
            }
        }
    }
    
    return {
        board, objects, state, allCards, cardQueue,
        networkUpdate, resetBoard, drawCards, resetState, 
        gameClick, offBoardClick, boardClick, updatePossibleMoves,
        executeAction, moveObject, moveObjectAndKill, killObject,
    }
}