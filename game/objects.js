const actions = require("./actions.js");

const objects = [
        {
            name:'King', 
            movable:true,
            killable:true,
            action:actions.moveObject,
        },
        {
            name:'Archer', 
            movable:true,
            killable:true,
            action:actions.moveOrKillObject,
        },
        {
            name:'Guard', 
            movable:true,
            killable:false,
            action:actions.moveObject
        },
        {
            name:'Warrior', 
            movable:true,
            killable:true,
            action:actions.moveObjectAndKill
        }
]

module.exports = objects;