export default function drawGame (ctx, game, canvas, players) {
    const myIndex = game.localState.playerIndex;
    const oponentIndex = myIndex == 0 ? 1 : 0;

    // Draw board and objects/troops:

    const board = game.state.board;
    
    const boardMarginX = canvas.width/2 - (board.width*board.tileSize) / 2;
    const boardMarginY = canvas.height/2 - (board.height*board.tileSize) / 2;


    ctx.font = '16px Arial';

    for (let y=0; y < board.tiles.length; y++) {
        for (let x=0; x < board.tiles[y].length; x++) {
            
            const tileY = myIndex == 1 ? y : board.tiles.length - y-1;
            const tileX = myIndex == 1 ? x : board.tiles[y].length - x-1;

            const offSetX = boardMarginX + x * board.tileSize;
            const offSetY = boardMarginY + y * board.tileSize;
            
            // Board:
            ctx.fillStyle = (parseInt(tileY)+parseInt(tileX))%2 == 0 ? "black" : "gray";
            ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);

            // Objects/troops
            if (board.tiles[tileY][tileX].occupied) {

                const objectID = board.tiles[tileY][tileX].object.id
                if (game.objects[objectID]) {
                    game.objects[objectID].draw(ctx, offSetX + (board.tileSize/2 - 12), offSetY + (board.tileSize/2 - 12), board);
                }
                if (board.tiles[tileY][tileX].object.team != myIndex) {
                    ctx.fillStyle = "rgba(255,0,0,0.3)";
                    ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);                            
                }
            }

        }
    }
    
    // Draw selection
    if(game.localState.selectedTile.x != null) {

        const tileY = myIndex == 1 ? game.localState.selectedTile.y : board.height - game.localState.selectedTile.y-1;
        const tileX = myIndex == 1 ? game.localState.selectedTile.x : board.width - game.localState.selectedTile.x-1;

        const offSetX = boardMarginX + tileX * board.tileSize;
        const offSetY = boardMarginY + tileY * board.tileSize;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);
    }

    // Draw cards
    for (const playerIndex in game.state.players) {

        const cards = game.state.players[playerIndex].cards

        for (let cardIndex in cards) {
            const colors = generateCardImage(game.state.allCards[cards[cardIndex]])

            const baseX = canvas.width / 2 + 120 * (cardIndex - 1);
            const baseY = playerIndex == myIndex ? (canvas.height - 160) : 0;

            for(let y=0; y<5; y++) {
                for (let x=0; x<5; x++) {
                    ctx.fillStyle = colors[y][x];


                    const offSetX = playerIndex == myIndex ? -25 + x * 10 : 15 - x * 10;
                    const offSetY = playerIndex == myIndex ? 80 + y * 10 : 120 - y * 10;

                    ctx.fillRect(baseX + offSetX, baseY + offSetY, 10, 10);
                }
            }

            ctx.strokeStyle = playerIndex == myIndex ? 'black' : 'red';
            ctx.fillStyle = playerIndex == myIndex ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 0, 0, 0)';

            ctx.strokeRect(baseX-25, baseY+80, 50, 50);
            ctx.fillRect(baseX-25, baseY+80, 50, 50);

            if (game.localState.selectedCardIndex && cardIndex == game.localState.selectedCardIndex && playerIndex == myIndex) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(baseX-25, (canvas.height-160)+80, 50, 50);
            }

        }
    }

    // Draw next cards
    for (const playerIndex in game.state.players) {

        const card = game.state.allCards[game.state.players[playerIndex].cardQueue[game.state.players[playerIndex].cardQueuePosition]];
        const colors = generateCardImage(card);

        const baseX = canvas.width / 2 - 250;
        const baseY = playerIndex == myIndex ? (canvas.height - 160) : 0;

        for(let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                ctx.fillStyle = colors[y][x];

                const offSetX = playerIndex == myIndex ? -25 + x * 7 : 15 - x * 7;
                const offSetY = playerIndex == myIndex ? 80 + y * 7 : 120 - y * 7;

                ctx.fillRect(baseX + offSetX, baseY + offSetY, 7, 7);
                    
            }
        }
    }

    // Draw possible moves

    for (const move of game.localState.possibleMoves) {

        const tileY = myIndex == 1 ? move.y : board.height - move.y-1;
        const tileX = myIndex == 1 ? move.x : board.width - move.x-1;

        const offSetX = boardMarginX + tileX * board.tileSize;
        const offSetY = boardMarginY + tileY * board.tileSize;

        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);

    }

    // Draw interface

    // *** TODO: Receber array players através do objeto game (ou incluir os nicknames no objeto state)
    ctx.font = "30px arial";
    ctx.fillStyle = myIndex == game.state.currentPlayer ? "Red" : "Black";
    ctx.fillText(players[myIndex].nickname, 320, 515);

    ctx.fillStyle = oponentIndex == game.state.currentPlayer ? "Red" : "Black";
    ctx.fillText(players[oponentIndex].nickname, 320, 215);
}

function generateCardImage (card) {
    const image = [

    ]

    for(let y=0; y<5; y++) {
        image[y] = []
        for (let x=0; x<5; x++) {
            image[y][x] = (x+y)%2 == 0 ? 'black' : 'gray';
        }
    }

    for(let move of card) {
        image[move[1]+2][move[0]+2] = 'green'
    }
    image[2][2] = 'yellow'

    return image;
}

