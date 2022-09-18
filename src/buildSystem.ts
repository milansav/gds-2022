type Building = {
    type: string;
    position: pc.Vec3;
    uuid: string;
    entity: pc.Entity;
    priority: number;
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

let globalFloors: Floor[] = [{
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

const globalFloorObjects: pc.Entity[] = [];
class BuildSystem extends pc.ScriptType {



    currentFloorObject: pc.Entity;

    currentFloor: number = 0;

    buildings: pc.Asset[];

    landMaterials: pc.Asset[];

    gameState: GameData;

    initialize() {
        this.app.on('event-demolish-building', this.handleDemolishHouse, this);
        this.app.on('event-grid-availability', this.handleAvailabilityEvent, this);
        this.app.on('event-grid-clicked', this.handleBuildEvent, this);
        this.app.on('event-floor-change', this.handleFloorChange, this);
        this.app.on('event-game-state-updated', this.handleStateUpdate, this);
        this.app.on('event-floor-down', this.handleFloorDown, this);
        this.app.on('event-floor-up', this.handleFloorUp, this);

        const floor = new pc.Entity();
        floor.name = `Floor ${this.currentFloor}`;

        this.app.root.addChild(floor);
        this.currentFloorObject = floor;

        globalFloorObjects.push(floor);

    }

    handleFloorDown() {
        this.currentFloorObject = globalFloorObjects[this.currentFloor-1];

        this.handleFloorChange(this.gameState.floor-1);

        globalFloorObjects.forEach(entity => {
            entity.setPosition(-1000, 0, 0);
        });

        globalFloorObjects[this.currentFloor].setPosition(0,0,0);

    }

    handleFloorUp() {
        if(globalFloorObjects.length-1 < this.gameState.floor + 1) {
            const floor = new pc.Entity();
            floor.name = `Floor ${this.gameState.floor + 1}`;

            this.app.root.addChild(floor);
            this.currentFloorObject = floor;

            globalFloorObjects.push(floor);
        } else {
            this.currentFloorObject = globalFloorObjects[this.currentFloor+1];
        }

        this.handleFloorChange(this.gameState.floor+1);

        globalFloorObjects.forEach(entity => {
            entity.setPosition(-1000, 0, 0);
        });

        globalFloorObjects[this.currentFloor].setPosition(0,0,0);
    }

    handleDemolishHouse(uuid: string) {
        console.log(`handle`, uuid);
        const currentFloor = globalFloors[this.currentFloor];

        const house = currentFloor.buildings.find(house => house.uuid === uuid);
        if(!house) return;
        const houseIndex = currentFloor.buildings.indexOf(house);
        currentFloor.buildings.splice(houseIndex, 1);
        house.entity.destroy();
    }

    handleStateUpdate(newState: GameData) {
        this.gameState = newState;
    }

    checkAvailability(coordinates: pc.Vec3): string {
        if(this.gameState.houseType === 'EMPTY') {
            return 'BLOCKED';
        }

        let status = 'EMPTY';

        const currentFloor = globalFloors[this.currentFloor];

        const buildings = currentFloor.buildings.filter(building => building.position.x === coordinates.x && building.position.z === coordinates.z);
        const buildingsCount = buildings.length;

        if(this.gameState.money < houseData[this.gameState.houseType].price)
            return 'BLOCKED';

        if(buildingsCount > 1) {
            status = 'ACTION';
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
                if(this.gameState.houseType === 'NONE')
                    status = 'ACTION';
                else
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

        const currentFloor = globalFloors[this.currentFloor];

        const buildings = currentFloor.buildings.filter(building => building.position.x === coordinates.x && building.position.z === coordinates.z);
        const buildingsCount = buildings.length;
        console.log(`Found ${buildingsCount} at this position`);

        const res = this.checkAvailability(coordinates);
        const canBuild = (() => {

            if(res === 'EMPTY') return true;
            return false;

        })();

        if(res === 'ACTION') {
            console.log(buildings);
            const house = buildings.find(house => house.type !== 'LAND');
            this.app.fire('event-house-action', house);
        }

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
        this.app.fire('event-update-game-state-housetype', "NONE");

    }

    spawnLand(coordinates: pc.Vec3) {

        const rotation = Math.random() * 360;

        const currentFloor = globalFloors[this.currentFloor];
        const uuid = crypto.randomUUID();

        const instance = this.buildings[buildingsMap['LAND']].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -2, coordinates.z));
        instance.setEulerAngles(0, rotation, 0);
        instance.name = uuid;

        const materialId = Math.round(Math.random() * (this.landMaterials.length-1));

        console.log(`material id ${materialId}`);

        console.log(this.landMaterials);

        instance.render?.meshInstances.forEach(instance => instance.material = this.landMaterials[materialId].resource as pc.Material);

        const temp: Building = {
            type: 'LAND',
            position: coordinates,
            uuid: uuid,
            entity: instance,
            priority: stormPriority['LAND']
        };

        this.currentFloorObject.addChild(instance);
        currentFloor.buildings.push(temp);
    }
    spawnPort(coordinates: pc.Vec3) {
        const currentFloor = globalFloors[this.currentFloor];

        const instance = this.buildings[buildingsMap['PORT']].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -1, coordinates.z));

        this.currentFloorObject.addChild(instance);
        currentFloor.buildings.push({
            type: 'PORT',
            position: coordinates,
            uuid: crypto.randomUUID(),
            entity: instance,
            priority: stormPriority['PORT']
        });
    }
    spawnHouse(coordinates: pc.Vec3) {
        const assetIndex = buildingsMap[this.gameState.houseType];

        const currentFloor = globalFloors[this.currentFloor];

        const instance = this.buildings[assetIndex].resource.instantiate() as pc.Entity;
        instance.setPosition(new pc.Vec3(coordinates.x, -1, coordinates.z));

        this.currentFloorObject.addChild(instance);
        currentFloor.buildings.push({
            type: this.gameState.houseType,
            position: coordinates,
            uuid: crypto.randomUUID(),
            entity: instance,
            priority: stormPriority[this.gameState.houseType]
        });
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