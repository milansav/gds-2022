class PassiveGenerator extends pc.ScriptType {

    gameState: GameData;
    booster: number;
    floorBonus: number = -1;

    initialize() {
        this.app.on('event-game-state-updated', this.handleGameStateUpdate, this);
        this.on('destroy', this.handleDestroyEvent, this);
    }

    update(dt: number) {
        if(!this.gameState) return;
        if(this.floorBonus < 0) {
            this.floorBonus = this.gameState.floor;
            this.app.fire('event-update-booster', this.booster);
        }
    }

    handleGameStateUpdate(gameState: GameData) {
        this.gameState = gameState;
    }

    handleDestroyEvent() {
        this.app.fire('event-update-booster', -this.booster);
    }
}

pc.registerScript(PassiveGenerator, 'passiveGenerator');
PassiveGenerator.attributes.add('booster', {
    type: 'number'
});