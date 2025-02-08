import actions from "./actions.js";

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
        action:actions.moveObject,
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
        action:actions.moveOrKillObject,
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
        action:actions.moveObject
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
        action:actions.moveObjectAndKill
    }
]

export default objects;