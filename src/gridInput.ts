class GridInput extends pc.ScriptType {

    pos: pc.Vec3 = new pc.Vec3();
    depth: number;
    camera: pc.Camera;
    offset: pc.Vec3;

    materials: pc.Asset[];

    minMaxX: number[];
    minMaxY: number[];
    shadow: pc.Asset;

    isInside: boolean = true;

    initialize() {
        //@ts-ignore
        this.camera = this.app.root.findByName("Camera")!.camera;

        this.app.mouse.disableContextMenu();

        this.app.on('event-screen-down', this.onMouseDown, this);
        this.app.on('event-screen-move', this.onMouseMove, this);
        this.app.on('event-grid-availability-result', this.getAvailabilityResult, this);

        for(let i = this.minMaxX[0]; i <= this.minMaxX[1]; i++) {
            for(let j = this.minMaxY[0]; j <= this.minMaxY[1]; j++) {
                const instance = this.shadow.resource.instantiate() as pc.Entity;

                instance.setPosition(i, -5, j);

                this.app.root.addChild(instance);
            }
        }
    }

    onMouseDown(event: any) {
        //@ts-ignore
        this.camera.screenToWorld(event.x, event.y, this.depth, this.pos);

        const clickPosition = this.lockPosition(this.pos);

        console.log(`Clicked at [${clickPosition.x},${clickPosition.z}]`);

        if(this.isInside) {
            this.app.fire('event-grid-clicked', clickPosition);
            this.app.fire('event-grid-availability', clickPosition);
        }
    }

    onMouseMove(event: any) {
        //@ts-ignore
        this.camera.screenToWorld(event.x, event.y, this.depth, this.pos);

        const clickPosition = this.lockPosition(this.pos);

        this.entity.setPosition(clickPosition);

        const isInsideX = clickPosition.x >= this.minMaxX[0] && clickPosition.x <= this.minMaxX[1];
        const isInsideY = clickPosition.z >= this.minMaxY[0] && clickPosition.z <= this.minMaxY[1];

        if(isInsideX && isInsideY) {
            this.isInside = true;
        } else {
            this.isInside = false;
        }

        this.app.fire('event-grid-availability', clickPosition);
    }

    lockPosition(input: pc.Vec3): pc.Vec3 {
        return new pc.Vec3(Math.floor(input.x+this.offset.x), Math.floor(input.y), Math.floor(input.z+this.offset.z));
    }

    getAvailabilityResult(result: string) {
        if(result === 'EMPTY') {
            //@ts-ignore
            this.entity.render?.meshInstances.forEach(instance => {
                instance.material = this.materials[1].resource;
            });
        } else if(result === 'ACTION') {
                this.entity.render?.meshInstances.forEach(instance => {
                    instance.material = this.materials[3].resource;
                });
        } else {
            this.entity.render?.meshInstances.forEach(instance => {
                instance.material = this.materials[2].resource;
            });
        }

        if(!this.isInside) {
            this.entity.render?.meshInstances.forEach(instance => {
                instance.material = this.materials[0].resource;
            });
        }
    }

}

pc.registerScript(GridInput, 'gridInput');
GridInput.attributes.add('depth', {
    type: 'number'
});
GridInput.attributes.add('offset', {
    type: 'vec3',
    description: 'Grid Offset'
});
// 0 - default
// 1 - OK
// 2 - not ok
GridInput.attributes.add('materials', {
    type: 'asset',
    array: true
});
GridInput.attributes.add('minMaxX', {
    type: 'number',
    array: true
});
GridInput.attributes.add('minMaxY', {
    type: 'number',
    array: true
})
GridInput.attributes.add('shadow', {
    type: 'asset'
});