const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

function printBoard(board) {
    for(let y=0; y<board.height; y++) {
        console.log(board.tiles[y])
    }
}

function draw () {
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);

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