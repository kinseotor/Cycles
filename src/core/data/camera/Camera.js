import { ComponentBase, Matrix4x4 } from '../../../Module.js';

class Camera {

    static AUTO_INIT = true;
    static IN_WebGPU = true;
    // WebGPU NDC：z∈ [0,1]
    // OpenGL NDC：z∈ [-1,1]

    static orthoSize = 100;
    static fov = 120;
    static aspect = 1;
    static near = 0.1;
    static far = 1000;

    static createPerspectiveMatrix4x4Data( fov = Camera.fov, aspect = Camera.aspect, near = Camera.near, far = Camera.far ) {
        fov = fov * Math.PI / 180;
        fov = Math.tan(fov / 2);
        return [
            fov / aspect, 0, 0, 0,
            0, fov, 0, 0,
            0, 0, (far + near) / (near - far),-1,
            0, 0, ( far * near) / (near - far), 0
        ];
    }
    
    static createOrthographicMatrix4x4Data(
        orthoSize = Camera.orthoSize,
        aspect = Camera.aspect,
        near = Camera.near,
        far = Camera.far
    ) {
        const dz = far - near;
        return [
            1/(orthoSize * aspect), 0, 0, 0,
            0, 1/orthoSize, 0, 0,
            0, 0, -1/dz, 0,       // 这里最后一项从 -1 改成 0！
            0, 0, -(near)/dz, 1
        ];
    }

    constructor( config = {} ) {
        config.type ??= 'Perspective'
        // super();

        this._type = config.type;
        this._name = '';

        this.property = {
            orthoSize: Camera.orthoSize,
            fov: Camera.fov,
            aspect: Camera.aspect,
            near: Camera.near,
            far: Camera.far,
        }

        this.status = {
            needUpdateProjectionMatrix4x4: true,
            hasChangeProjectionMatrix4x4: false,
            needUpdateToShader: true,
        }

        this.projectionMatrix4x4 = new Matrix4x4();
        if ( Camera.AUTO_INIT && this._type === 'Perspective') {
            this.setPerspective();
        } else if ( Camera.AUTO_INIT && this._type === 'Orthographic') {
            this.setOrthographic();
        }
    }

    get type() {
        return this._type;
    }
    
    set orthoSize(value) {
        if ( this.property.orthoSize == value ) return;
        this._type = 'Orthographic';
        this.property.orthoSize = value;
        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }
    get orthoSize() {
        return this.property.orthoSize;
    }

    set fov(value) {
        if ( this.property.fov == value ) return;
        this._type = 'Perspective';
        this.property.fov = value;
        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }
    get fov() {
        return this.property.fov;
    }

    set aspect(value) {
        if ( this.property.aspect == value ) return
        this.property.aspect = value;
        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }
    get aspect() {
        return this.property.aspect;
    }

    set near(value) {
        if ( this.property.near == value ) return
        this.property.near = value;
        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }
    get near() {
        return this.property.near;
    }

    set far(value) {
        if ( this.property.far == value ) return
        this.property.far = value;
        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }
    get far() {
        return this.property.far;
    }
    // need check proprety
    setPerspective( fov = this.fov, aspect = this.aspect, near = this.near, far = this.far ) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this._type = 'Perspective';

        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }

    // need check proprety
    setOrthographic( orthoSize = this.orthoSize, aspect = this.aspect, near = this.near, far = this.far ) {
        this.orthoSize = orthoSize;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this._type = 'Orthographic';

        this.status.needUpdateProjectionMatrix4x4 = true;
        return this;
    }

    // auto update 
    update() {
        if ( !this.status.needUpdateProjectionMatrix4x4 ) return;
        if ( this._type === "Perspective") {
            this.projectionMatrix4x4.element = Camera.createPerspectiveMatrix4x4Data(this.fov,this.aspect,this.near,this.far);
        } else if ( this._type === "Orthographic" ){
            this.projectionMatrix4x4.element = Camera.createOrthographicMatrix4x4Data(this.orthoSize,this.aspect,this.near,this.far);
        }
        this.status.needUpdateProjectionMatrix4x4 = false;
        this.status.hasChangeProjectionMatrix4x4 = true;
    }

}

export { Camera }