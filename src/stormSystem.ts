type StormData = {
    targetPosition: pc.Vec3;
    targetUUID: string;
};

const stormPriority: {
    [key: string]: number
} = {
    'WINDBLOWER': 1000,
    'ELEVATOR': 500,
    'PORT': 100
};

class StormSystem extends pc.ScriptType {

    cooldown: number;
    baseCooldown: number;
    stormAsset: pc.Asset;

    gameState: GameData;

    initialize() {
        this.cooldown = this.baseCooldown;
        this.app.on('event-game-state-updated', this.handleGameStateUpdate, this);
    }

    update(dt: number) {
        this.cooldown -= dt;

        if(this.cooldown < 0) {
            this.cooldown = this.baseCooldown;
            //Spawn storm
            console.log(`Storm spawning at floor ${this.gameState.floor}`);
            const targets = globalFloors[this.gameState.floor].buildings.filter(house => house.type !== 'LAND').sort((a, b) => stormPriority[a.type] + stormPriority[b.type]);

            if(targets.length === 0) {
                return;
            }

            const spawnPosition = new pc.Vec3(10, 2, 10);
            const targetPosition = targets[0].position;
            const uuid = targets[0].uuid;

            const instance = this.stormAsset.resource.instantiate() as pc.Entity;
            const stormScript = instance.script?.get('storm') as Storm;

            globalFloorObjects[this.gameState.floor].addChild(instance);

            const data: StormData = {
                targetPosition: targetPosition,
                targetUUID: uuid
            };

            stormScript.fire('set-target', data);
        }
    }

    handleGameStateUpdate(gameState: GameData) {
        this.gameState = gameState;
    }

}

pc.registerScript(StormSystem, 'stormSystem');
StormSystem.attributes.add('baseCooldown', {
    type: 'number'
});
StormSystem.attributes.add('stormAsset', {
    type: 'asset'
});