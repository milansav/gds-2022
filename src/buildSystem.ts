type Building = {
    type: string;
    position: pc.Vec3;
};

type Floor = {
    buildings: Building[];
};

const buildingsMap: {
    [key: string]: number
} = {
    'LAND': 0,
    'BANK': 1,
    'ELEVATOR': 2,
    'PORT': 3,
    'WINDBLOWER': 4,
    'WINDMILL': 5,
    'FARM': 6,
    'HOUSE': 7
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

    floorObjects: pc.Entity[] = [];

    currentFloorObject: pc.Entity;

    currentFloor: number = 0;

    buildings: pc.Asset[];

    landMaterials: pc.Asset[];

    gameState: GameData;

    initialize() {
        this.app.on('event-grid-availability', this.handleAvailabilityEvent, this);
        this.app.on('event-grid-clicked', this.handleBuildEvent, this);
        this.app.on('event-floor-change', this.handleFloorChange, this);
        this.app.on('event-game-state-updated', this.handleStateUpdate, this);

        const floor = new pc.Entity();
        floor.name = `Floor ${this.currentFloor}`;

        this.app.root.addChild(floor);
        this.currentFloorObject = floor;

        this.floorObjects.push(floor);

    }

    handleStateUpdate(newState: GameData) {
        this.gameState = newState;
    }

    checkAvailability(coordinates: pc.Vec3): string {
        if(this.gameState.houseType === 'EMPTY') {
            return 'BLOCKED';
        }

        let status = 'EMPTY';

        const currentFloor = this.floors[this.currentFloor];

        const buildings = currentFloor.buildings.filter(building => building.position.x === coordinates.x && building.position.z === coordinates.z);
        const buildingsCount = buildings.length;

        console.log(buildings);

        if(this.gameState.money < houseData[this.gameState.houseType].price)
            return 'BLOCKED';

        if(buildingsCount > 1) {
            status = 'BLOCKED';
        } else if(buildingsCount === 1) {
            console.log(buildings[0].type, this.gameState.houseType);
            if(buildings[0].type === 'EMPTY') {
                if(this.gameState.houseType !== 'LAND')
                    status = 'BLOCKED';
            } else if(buildings[0].type === 'LAND') {
                if(this.gameState.houseType === 'LAND' || this.gameState.houseType === 'PORT')
                    status = 'BLOCKED';
                else if(this.gameState.houseType === 'NONE')
                    status = 'BLOCKED';
            } else if(buildings[0].type === 'PORT') {
                status = 'BLOCKED';
            }
        } else if(buildingsCount === 0) {
            if(this.gameState.houseType !== 'LAND' && this.gameState.houseType !== 'PORT')
                status = 'BLOCKED';
        }

        return status;
    }

    handleAvailabilityEvent(coordinates: pc.Vec3) {

        const status = this.checkAvailability(coordinates);

        this.app.fire('event-grid-availability-result', status);
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

        const canBuild = (() => {
            const res = this.checkAvailability(coordinates)

            if(res === 'EMPTY') return true;
            return false;

        })();

        if(!canBuild) return;

        switch(this.gameState.houseType) {
            case 'LAND':
                this.spawnLand(coordinates);
            break;
            case 'PORT':
                this.spawnPort(coordinates);
                break;
            default:
                this.spawnHouse(coordinates);
        }

        this.app.fire('event-purchase', houseData[this.gameState.houseType].price);

    }

    spawnLand(coordinates: pc.Vec3) {

        const rotation = Math.random() * 360;

        const currentFloor = this.floors[this.currentFloor];
        currentFloor.buildings.push({
            type: 'LAND',
            position: coordinates
        });

        const instance = this.buildings[buildingsMap['LAND']].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -2, coordinates.z));
        instance.setEulerAngles(0, rotation, 0);

        const materialId = Math.round(Math.random() * (this.landMaterials.length-1));

        console.log(`material id ${materialId}`);

        console.log(this.landMaterials);

        instance.render?.meshInstances.forEach(instance => instance.material = this.landMaterials[materialId].resource as pc.Material);

        this.currentFloorObject.addChild(instance);
    }
    spawnPort(coordinates: pc.Vec3) {
        const currentFloor = this.floors[this.currentFloor];
        currentFloor.buildings.push({
            type: 'PORT',
            position: coordinates
        });

        const instance = this.buildings[buildingsMap['PORT']].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -1, coordinates.z));

        this.currentFloorObject.addChild(instance);
    }
    spawnHouse(coordinates: pc.Vec3) {
        const assetIndex = buildingsMap[this.gameState.houseType];

        const currentFloor = this.floors[this.currentFloor];

        currentFloor.buildings.push({
            type: this.gameState.houseType,
            position: coordinates
        });

        const instance = this.buildings[assetIndex].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -1, coordinates.z));

        this.currentFloorObject.addChild(instance);
    }

}

pc.registerScript(BuildSystem, 'buildSystem');
BuildSystem.attributes.add('buildings', {
    type: 'asset',
    array: true
});
BuildSystem.attributes.add('landMaterials', {
    type: 'asset',
    array: true
});