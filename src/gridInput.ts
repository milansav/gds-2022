class GridInput extends pc.ScriptType {

    pos: pc.Vec3 = new pc.Vec3();
    depth: number;
    camera: pc.Camera;
    offset: pc.Vec3;

    initialize() {
        //@ts-ignore
        this.camera = this.app.root.findByName("Camera")!.camera;

        this.app.mouse.disableContextMenu();

        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    onMouseDown(event: any) {
        //@ts-ignore
        this.camera.screenToWorld(event.x, event.y, this.depth, this.pos);

        const clickPosition = this.lockPosition(this.pos);

        console.log(`Clicked at [${clickPosition.x},${clickPosition.z}]`);

        this.app.fire('event-grid-clicked', clickPosition);
    }

    onMouseMove(event: any) {
        //@ts-ignore
        this.camera.screenToWorld(event.x, event.y, this.depth, this.pos);

        this.entity.setPosition(this.lockPosition(this.pos));
    }

    lockPosition(input: pc.Vec3): pc.Vec3 {
        return new pc.Vec3(Math.floor(input.x+this.offset.x), Math.floor(input.y), Math.floor(input.z+this.offset.z));
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