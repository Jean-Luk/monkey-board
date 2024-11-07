import drawGame from "./drawGame.js";

export default function requestDraw () {
    
    const players = [];

    function networkUpdate (command) {
        if (command.event == "gameStarted") {
            players[0] = command.players[0];
            players[1] = command.players[1];
        }
    }

    function draw (ctx, mainInfo, game, canvas) {

        ctx.clearRect(0,0,canvas.width,canvas.height)
        if (mainInfo.inGame) {
            drawGame(ctx, game, canvas, players);
        }

        requestAnimationFrame(() => {
            draw(ctx, mainInfo, game, canvas);
        });

    }

    return {draw, networkUpdate};
}