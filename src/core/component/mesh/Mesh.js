import { ComponentBase } from "../../../Module.js";

class Mesh extends ComponentBase{
    
    COMPONENT_TYPE = 'Mesh';
    _geometry = null;

    constructor( config = {} ) {
        super();
    }

    set geometry( geometry ) {
        this._geometry = geometry;
    }

    childrenMeshList = [

    ]
}

class MeshChild {
    constructor() {
        this.needRender = true;
        this.offset = 0;
        this.length = 0;
        this._material = null;
    }

    set material( material ) {
        this._material = material;
    }
}

// console.log( new Mesh() );

export { Mesh }