const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

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
    },
    {
        name:'Archer', 
        draw:function(ctx,x,y) {
            ctx.fillStyle = 'green';
            ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
        },
        movable:true,
        killable:true,
    },
    {
        name:'Guard', 
        draw:function(ctx,x,y) {
            ctx.fillStyle = 'brown';
            ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
        },
        movable:true,
        killable:false,
    },
    {
        name:'Warrior', 
        draw:function(ctx,x,y) {
            ctx.fillStyle = 'red';
            ctx.fillRect(board.tileSize*x + board.margin.x, board.tileSize*y + board.margin.y, 25, 25);
        },
        movable:true,
        killable:true,
    }
]

const game = {
    selectedTile:{
        y:null, x:null
    },
    players:[
        {cards:[]},
        {cards:[]}
    ], 
    nextMove: 0, // de quem é a vez
    selectedCard: null,
    possibleMoves: []
}

const allCards = [
    [[0,-1], [0,-2]], 
    [[1,-1], [-1,-1]],
    [[1,-2], [-1,-2]]
]

function resetBoard () {
    for(let y=0; y<board.height; y++) {
        board.tiles[y]=[]
        for (let x=0; x<board.width; x++) {
            board.tiles[y][x] = {occupied:false, object:null}
        }
    }

    // 0: King
    // 1: Archer
    // 2: Guards
    // 3: Warriors
    for (let i=0; i<=1; i++) {
        board.tiles[i*(board.height-1)][0] = {occupied:true, object:{id:3, team:i}}
        board.tiles[i*(board.height-1)][1] = {occupied:true, object:{id:2, team:i}}
        board.tiles[i*(board.height-1)][2] = {occupied:true, object:{id:1, team:i}}
        board.tiles[i*(board.height-1)][3] = {occupied:true, object:{id:0, team:i}}
        board.tiles[i*(board.height-1)][4] = {occupied:true, object:{id:1, team:i}}
        board.tiles[i*(board.height-1)][5] = {occupied:true, object:{id:2, team:i}}
        board.tiles[i*(board.height-1)][6] = {occupied:true, object:{id:3, team:i}}

    }
}

function printBoard() {
    for(let y=0; y<board.height; y++) {
        console.log(board.tiles[y])
    }
}

function drawCards () {
    game.players[0].cards = [0,1,2]
    game.players[1].cards = [0,1,2]
}
function resetGame () {
    resetBoard();
    drawCards();
}
resetGame();
canvas.addEventListener('click', function(event) {
    const xClick = event.offsetX;
    const yClick = event.offsetY;

    if (xClick>board.margin.x && xClick<board.margin.x+board.width*board.tileSize) {
        if (yClick>board.margin.y && yClick<board.margin.y+board.height*board.tileSize) {
            // ** GAME **
            const newSelectedTile={
                x: Math.floor((xClick-board.margin.x)/board.tileSize),
                y: Math.floor((yClick-board.margin.y)/board.tileSize)
            }

            const clickedOnPossibleMove = checkIfClickedOnPossibleMove(xClick, yClick)
            if (clickedOnPossibleMove) {
                executeAction(clickedOnPossibleMove);
                return;
            }

            if(newSelectedTile.x == game.selectedTile.x && newSelectedTile.y == game.selectedTile.y) {
                game.selectedTile.x=null;
                game.selectedTile.y=null;
            } else {
                game.selectedTile = newSelectedTile;
            }
            updatePossibleMoves();
        }
    }
    cards = game.players[game.nextMove].cards
    for (cardIndex in cards) {

        if (xClick > canvas.width/2+(120*(cardIndex-1))-25 && xClick < canvas.width/2+(120*(cardIndex-1))-25 + 50) {
            if (yClick > game.nextMove*(canvas.height-160)+80 && yClick < game.nextMove*(canvas.height-160)+130) {

                game.selectedCard = cardIndex;
                updatePossibleMoves();
                break
            }
        }
    }
    
});

function executeAction (coords) {
    const objectTile = board.tiles[game.selectedTile.y][game.selectedTile.x];
    const objectId = objectTile.object.id
    if (objectId === 0) {
        moveObject(objectTile, coords);
    } else if (objectId === 1) {
        killObject(coords);
    } else if (objectId === 3) {
        moveObjectAndKill(objectTile, coords);
    }

    game.selectedTile.x=null;
    game.selectedTile.y=null;

    game.nextMove = game.nextMove == 0 ? 1 : 0;
    game.selectedCard = null;
    updatePossibleMoves();
}

function moveObject (objectTile, coords) {
    const destinationTile = board.tiles[coords[1]][coords[0]]
    if (destinationTile.occupied) return;

    board.tiles[coords[1]][coords[0]] = { ...objectTile }
    board.tiles[game.selectedTile.y][game.selectedTile.x] = {occupied:false, object:null}
}

function moveObjectAndKill (objectTile, coords) {
    board.tiles[coords[1]][coords[0]] = { ...objectTile }
    board.tiles[game.selectedTile.y][game.selectedTile.x] = {occupied:false, object:null}
}

function killObject (coords) {
    // !!! Check if is killable
    board.tiles[coords[1]][coords[0]] = {occupied:false, object:null}
}

function checkIfClickedOnPossibleMove (x, y) {
    for(movableTile of game.possibleMoves) {
        if(x > movableTile[0]*board.tileSize + board.margin.x && x < movableTile[0]*board.tileSize + board.margin.x + board.tileSize) {
            if(y > movableTile[1]*board.tileSize + board.margin.y && y < movableTile[1]*board.tileSize + board.margin.y + board.tileSize) {
                return(movableTile);
            }
        }
    }
    return false
}

function updatePossibleMoves () {
    game.possibleMoves = []

    if(game.selectedTile.x === null) return;

    const currentTile = board.tiles[game.selectedTile.y][game.selectedTile.x]
    const currentCard = allCards[game.players[game.nextMove].cards[game.selectedCard]]


    if (currentTile.occupied && objects[currentTile.object.id].movable) {
        for(const moveIndex in currentCard) {
            // Inverte as coordenadas caso seja do time de cima
            if (currentTile.object.team===0) {
                const newMove = [game.selectedTile.x-currentCard[moveIndex][0], game.selectedTile.y-currentCard[moveIndex][1]];

                if(!(newMove[0] >= board.width || newMove[0] < 0)) {
                    if(!(newMove[1] >= board.height || newMove[1] < 0)) {
                        game.possibleMoves.push(newMove);
                    }
                }
            } else {
                const newMove = [game.selectedTile.x+currentCard[moveIndex][0], game.selectedTile.y+currentCard[moveIndex][1]];

                if(!(newMove[0] >= board.width || newMove[0] < 0)) {
                    if(!(newMove[1] >= board.height || newMove[1] < 0)) {
                        game.possibleMoves.push(newMove);
                    }
                }

            }

        }
    }
}

function draw () {
    ctx.clearRect(0,0, innerWidth, innerHeight);
    console.log(innerHeight);
    
    // Draw board:
    let x = board.margin.x;
    let y = board.margin.y;
    for (let i=0; i<board.height; i++) {
        for(let j=0; j<board.width; j++) {
            ctx.fillStyle = (j+i)%2 == 0 ? 'black' : 'gray';
            ctx.fillRect(x,y, 50, 50)
            
            x+=board.tileSize;

        }
        x=board.margin.x;
        y+=board.tileSize;
    }
    
    // Draw objects/troops
    for(let y=0; y<board.height; y++) {
        for (let x=0; x<board.width; x++) {
            if (board.tiles[y][x].occupied) {
                objectID = board.tiles[y][x].object.id
                if (objects[objectID]) {
                    objects[objectID].draw(ctx, x, y);
                }
            }
        }
    }
    
    // Draw selection
    if(game.selectedTile.x != null) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect((game.selectedTile.x)*board.tileSize + board.margin.x, (game.selectedTile.y)*board.tileSize + board.margin.y, 50, 50)
    }

    // Draw cards
    for (const playerIndex in game.players) {
        cards = game.players[playerIndex].cards
        for (cardIndex in cards) {

            if (playerIndex == game.nextMove && cardIndex == game.selectedCard) {
                ctx.fillStyle = 'red';
            } else {
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            }

            ctx.strokeRect(canvas.width/2+(120*(cardIndex-1))-25, playerIndex*(canvas.height-160)+80, 50, 50); 
            ctx.fillRect(canvas.width/2+(120*(cardIndex-1))-25, playerIndex*(canvas.height-160)+80, 50, 50);    
        }
    }

    // Draw possible moves

    for (const move of game.possibleMoves) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect((move[0])*board.tileSize + board.margin.x, (move[1])*board.tileSize + board.margin.y, 50, 50)

    }

    requestAnimationFrame(draw);
}

draw();