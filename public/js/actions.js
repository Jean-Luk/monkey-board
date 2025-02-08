export default {

    moveObject: function (command, state) {
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]

        if (targetTile.occupied) return false;

        return true;
    },

    moveObjectAndKill: function (command, state, objects) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]
        
        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        }

        return true;
    },

    moveOrKillObject: function (command, state, objects) {
        const objectTile = command.objectTile;
        const coords = command.coords

        const targetTile = state.board.tiles[coords.y][coords.x]

        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == objectTile.object.team) {
                return false;
            }
        }
        
        return true;
    }
}