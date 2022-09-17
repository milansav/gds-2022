type Building = {
    type: string;
    position: pc.Vec3;
};

type Floor = {
    buildings: Building[];
};

class BuildSystem extends pc.ScriptType {

    floors: Floor[] = [{
        buildings: []
    }, {
        buildings: []
    }, {
        buildings: []
    }, {
        buildings: []
    }, {
        buildings: []
    }];

    currentFloor: number = 0;

    selectedBuilding: number = 0;

    buildings: pc.Asset[];

    initialize() {
        this.app.on('event-grid-clicked', this.handleBuildEvent, this);
        this.app.on('event-floor-change', this.handleFloorChange, this);
    }

    handleFloorChange(newFloor: number) {
        this.currentFloor = newFloor;
    }

    handleBuildEvent(coordinates: pc.Vec3) {
        console.log(`Build system registered click @ ${coordinates.x},${coordinates.z}`);

        const currentFloor = this.floors[this.currentFloor];

        const buildings = currentFloor.buildings.filter(building => building.position.x === coordinates.x && building.position.z === coordinates.z);
        const buildingsCount = buildings.length;
        console.log(`Found ${buildingsCount} at this position`);

        if(buildingsCount === 0) {
            currentFloor.buildings.push({
                type: 'EMPTY',
                position: coordinates
            });

            const instance = this.buildings[this.selectedBuilding].resource.instantiate() as pc.Entity;
            instance.setPosition(coordinates);
            this.app.root.addChild(instance);
        }


    }

}

pc.registerScript(BuildSystem, 'buildSystem');
BuildSystem.attributes.add('buildings', {
    type: 'asset',
    array: true
});