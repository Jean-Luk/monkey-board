import drawGame from "./drawGame.js";

export default function requestDraw () {
    
    let players = [];

    function networkUpdate (command) {
        if (command.event == "gameStarted") {
            players = command.players
        }
    }

    function draw (ctx, mainInfo, gameInfo, canvas) {
        ctx.clearRect(0,0,canvas.width,canvas.height)

        if (mainInfo.inGame) {
            drawGame(ctx, gameInfo, canvas, players);
        }

        requestAnimationFrame(() => {
            draw(ctx, mainInfo, gameInfo, canvas);
        });

    }

    return {draw, networkUpdate};
}