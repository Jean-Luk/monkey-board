import drawGame from "./drawGame.js";

export default function requestDraw () {
    
    function draw (ctx, mainInfo, gameState, canvas) {
        ctx.clearRect(0,0,canvas.width,canvas.height)

        if (mainInfo.inGame) {
            drawGame(ctx, gameState, canvas);
        }

        requestAnimationFrame(() => {
            draw(ctx, mainInfo, gameState, canvas);
        });

    }

    return {draw};
}