class Storm extends pc.ScriptType {

    hasTarget: boolean = false;
    targetCoords: pc.Vec3;
    targetUUID: string;
    travelTime: number;

    initialize() {
        this.on('set-target', this.handleSetTarget, this);
    }

    update(dt: number) {
        if(!this.hasTarget) return;

        const diffX = this.entity.getPosition().x - this.targetCoords.x;
        const diffY = this.entity.getPosition().z - this.targetCoords.z;

        if(Math.abs(diffX) < 1 && Math.abs(diffY)) {
            this.app.fire('event-demolish-building', this.targetUUID);
            this.entity.destroy();
        }

        this.entity.translate(-diffX * dt / this.travelTime, 0, -diffY * dt / this.travelTime);
    }

    handleSetTarget(data: StormData) {
        console.log(`event handled`);

        this.targetCoords = data.targetPosition;
        this.targetUUID = data.targetUUID;
        this.hasTarget = true;
    }
}

pc.registerScript(Storm, 'storm');
Storm.attributes.add('travelTime', {
    type: "number"
});