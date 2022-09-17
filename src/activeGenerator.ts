class ActiveGenerator extends pc.ScriptType {

    gameState: GameData;
    floorBonus: number = -1;

    initialize() {
        this.app.on('event-game-state-updated', this.handleGameStateUpdate, this);
        this.app.fire('force-state-update');
    }

    update(dt: number) {
        if(!this.gameState) return;
        if(this.floorBonus < 0)
            this.floorBonus = this.gameState.floor;
        const earning = (this.gameState.baseEarning * dt) / 60;

        this.app.fire('event-earn-money', earning);
    }

    handleGameStateUpdate(gameState: GameData) {
        this.gameState = gameState;
    }
}

pc.registerScript(ActiveGenerator, 'activeGenerator');
ActiveGenerator.attributes.add('multiplier', {
    type: 'number'
});