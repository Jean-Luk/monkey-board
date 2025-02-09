const actions = {
    moveObject: function (state, selectedTileCoords, targetTileCoords) {

        const board = state.board
        const targetTile = board.tiles[targetTileCoords.y][targetTileCoords.x]

        if (targetTile.occupied) return false;

        const selectedTile = board.tiles[selectedTileCoords.y][selectedTileCoords.x];

        board.tiles[targetTileCoords.y][targetTileCoords.x] = { ...selectedTile }
        board.tiles[selectedTileCoords.y][selectedTileCoords.x] = {occupied:false, object:null}

        return true;
    },
    moveObjectAndKill: function (state, selectedTileCoords, targetTileCoords, objects) {
        
        const board = state.board
        const selectedTile = board.tiles[selectedTileCoords.y][selectedTileCoords.x];
        const targetTile = board.tiles[targetTileCoords.y][targetTileCoords.x]
        
        let killedTile = null;
        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == selectedTile.object.team) {
                return false;
            } else {
                killedTile = {id:targetTile.object.id, team:targetTile.object.team};
            }
        }
    
        board.tiles[targetTileCoords.y][targetTileCoords.x] = { ...selectedTile };
        board.tiles[selectedTileCoords.y][selectedTileCoords.x] = {occupied:false, object:null};
    
        killedObject(state, killedTile)
    
        return true;
    },
    moveOrKillObject: function (state, selectedTileCoords, targetTileCoords, objects) {

        const board = state.board
        const targetTile = board.tiles[targetTileCoords.y][targetTileCoords.x]
        const selectedTile = board.tiles[selectedTileCoords.y][selectedTileCoords.x];
    
        let killedTile = null;
        if (targetTile.occupied) {
            if (!(objects[targetTile.object.id].killable) || targetTile.object.team == selectedTile.object.team) {
                return false;
            } else {
                killedTile = {id:targetTile.object.id, team:targetTile.object.team}
            }
    
            board.tiles[targetTileCoords.y][targetTileCoords.x] = {occupied:false, object:null}    
            killedObject(state, killedTile);
    
        } else {
            board.tiles[targetTileCoords.y][targetTileCoords.x] = { ...selectedTile }
            board.tiles[selectedTileCoords.y][selectedTileCoords.x] = {occupied:false, object:null}    
            
        }
    
    
        return true;
    }
}

function killedObject (state, killedTile) {
    if (!killedTile) return;

    if (killedTile.id == 0) {
        finishGame(state, killedTile.team === 0 ? 1 : 0);
    }
}

function finishGame (state, winner) {
    state.winner = winner;

}

module.exports = actions;