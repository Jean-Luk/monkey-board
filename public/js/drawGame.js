export default function drawGame (ctx, gameInfo, canvas) {
    const myIndex = gameInfo.localState.playerIndex;
    const oponentIndex = myIndex == 0 ? 1 : 0;

    // Draw board and objects/troops:

    const board = gameInfo.state.board;
    
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
                if (gameInfo.objects[objectID]) {
                    gameInfo.objects[objectID].draw(ctx, offSetX + (board.tileSize/2 - 12), offSetY + (board.tileSize/2 - 12), board);
                }
                if (board.tiles[tileY][tileX].object.team != myIndex) {
                    ctx.fillStyle = "rgba(255,0,0,0.3)";
                    ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);                            
                }
            }

        }
    }
    
    // Draw selection
    if(gameInfo.localState.selectedTile.x != null) {

        const tileY = myIndex == 1 ? gameInfo.localState.selectedTile.y : board.height - gameInfo.localState.selectedTile.y-1;
        const tileX = myIndex == 1 ? gameInfo.localState.selectedTile.x : board.width - gameInfo.localState.selectedTile.x-1;

        const offSetX = boardMarginX + tileX * board.tileSize;
        const offSetY = boardMarginY + tileY * board.tileSize;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);
    }

    // Draw cards
    for (const playerIndex in gameInfo.state.players) {
        
        const cards = gameInfo.state.players[playerIndex].cards
        const spaceBetweenCards = board.width*board.tileSize/(cards.length)

        for (let cardIndex in cards) {
            const colors = generateCardImage(gameInfo.state.allCards[cards[cardIndex]])
        
            const baseX = boardMarginX + (cardIndex * spaceBetweenCards) +  spaceBetweenCards/2 - 25;
            const baseY = playerIndex == myIndex ? (boardMarginY + board.height*board.tileSize + 42 ) : boardMarginY - 92;
            
            // Cards borders
            ctx.strokeStyle = playerIndex == myIndex ? 'black' : 'red';
            ctx.fillStyle = playerIndex == myIndex ? 'rgb(0, 0, 0)' : 'rgb(255, 0, 0)';
            ctx.fillRect(baseX-1, baseY-1, 52, 52);

            
            for(let y=0; y<5; y++) {
                for (let x=0; x<5; x++) {
                    ctx.fillStyle = colors[y][x];


                    const offSetX = playerIndex == myIndex ? x * 10 : 40 - x * 10;
                    const offSetY = playerIndex == myIndex ? y * 10 : 40 - y * 10;

                    ctx.fillRect(baseX + offSetX, baseY + offSetY, 10, 10);
                }
            }

            if (gameInfo.localState.selectedCardIndex && cardIndex == gameInfo.localState.selectedCardIndex && playerIndex == myIndex) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(baseX, boardMarginY + board.height*board.tileSize + 42 , 50, 50);
            }

        }
    }

    // Draw next cards
    for (const playerIndex in gameInfo.state.players) {

        const card = gameInfo.state.allCards[gameInfo.state.players[playerIndex].cardQueue[gameInfo.state.players[playerIndex].cardQueuePosition]];
        const colors = generateCardImage(card);

        const baseX = boardMarginX - 51;
        const baseY = playerIndex == myIndex ? (boardMarginY + board.height*board.tileSize + 52) : boardMarginY - 82;

        for(let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                ctx.fillStyle = colors[y][x];

                const offSetX = playerIndex == myIndex ? x * 7 : 28 - x * 7;
                const offSetY = playerIndex == myIndex ? y * 7 : 28 - y * 7;

                ctx.fillRect(baseX + offSetX, baseY + offSetY, 7, 7);
                    
            }
        }
    }

    // Draw possible moves

    for (const move of gameInfo.localState.possibleMoves) {

        const tileY = myIndex == 1 ? move.y : board.height - move.y-1;
        const tileX = myIndex == 1 ? move.x : board.width - move.x-1;

        const offSetX = boardMarginX + tileX * board.tileSize;
        const offSetY = boardMarginY + tileY * board.tileSize;

        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(offSetX, offSetY, board.tileSize, board.tileSize);

    }

    // Draw interface

    ctx.font = "30px arial";
    ctx.fillStyle = 'black'

    ctx.fillText(gameInfo.state.players[myIndex].nickname, boardMarginX, boardMarginY + board.tileSize * board.height + 26);
    ctx.fillText(gameInfo.state.players[oponentIndex].nickname, boardMarginX, boardMarginY - 4);

    ctx.fillStyle = 'green';
    if (myIndex == gameInfo.state.currentPlayer) {
        ctx.fillRect(boardMarginX - 20, boardMarginY + board.tileSize * board.height + 10, 16, 16)
    } else {
        ctx.fillRect(boardMarginX - 20, boardMarginY - 22, 16, 16)
    }

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

