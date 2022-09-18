class Storm extends pc.ScriptType {

    hasTarget: boolean = false;
    targetCoords: pc.Vec3;
    targetUUID: string;

    initialize() {
        this.on('set-target', this.handleSetTarget, this);
    }

    handleSetTarget(data: StormData) {
        console.log(`event handled`);

        this.targetCoords = data.targetPosition;
        this.targetUUID = data.targetUUID;
    }
}

pc.registerScript(Storm, 'storm');