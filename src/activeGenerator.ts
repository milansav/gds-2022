class ActiveGenerator extends pc.ScriptType {

    gameState: GameData;
    floorBonus: number = -1;
    timeElapsed: number = 0;
    multiplier: number;

    initialize() {
        this.app.on('event-game-state-updated', this.handleGameStateUpdate, this);
        this.app.fire('force-state-update');
    }

    update(dt: number) {
        if(!this.gameState) return;
        if(this.floorBonus < 0)
            this.floorBonus = this.gameState.floor;

        if(this.timeElapsed < 1) {
            this.timeElapsed += dt;
            return;
        }

        const earning = (this.gameState.baseEarning * this.multiplier * this.timeElapsed) / 60;

        console.log(`Earned per second ${earning}`);

        this.app.fire('event-earn-money', earning);

        this.timeElapsed = 0;
    }

    handleGameStateUpdate(gameState: GameData) {
        this.gameState = gameState;
    }
}

pc.registerScript(ActiveGenerator, 'activeGenerator');
ActiveGenerator.attributes.add('multiplier', {
    type: 'number'
});