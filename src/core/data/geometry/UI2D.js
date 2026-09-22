

class UI2D {
    constructor() {
        this._type = 'UI2D'
        
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            colors: [],
            indices: [],
        }
        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
        this.config =  {
            depthTest: true,
            topology: 'triangle-list',
            cullMode: 'back',
        }
        
        this.WebGLBuffer = {}
        this.WebGPUBuffer = {}
    }
    
    get type(){
        return this._type;
    }
}

class Sprite extends UI2D{
    constructor() {
        super();
    }
}