class ComponentBase {

    static instance_index = 0;
    static INSTANCE_LIST = [];

    static add( instance ) {
        if ( instance.__proto__.constructor === this && this.getUniformLocation( instance ) < 0 ) {
            this.INSTANCE_LIST.push(instance);
        } else {
            console.warn('!type')
        }
    }
    
    static getUniformLocation( instance ) {
        let result = null;
        if ( instance && instance instanceof this ) {
            result = this.INSTANCE_LIST.indexOf( instance );
        }
        return result;
    }

    _type = 'Component';
    COMPONENT_TYPE = null;
    _name = '';

    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }

    property = {}
    get property() {
        return this.property;
    }

    getNodeDate = {
        worldMatrix4x4: false,
        normalMatrix3x3: false,
        inverseWorldMatrix4x4: false,
    }

    setEntity3D( entity ) {
        if (entity.type !=='Entity3D') console.warn('type error')
        this.entity = entity;
    }
}

export { ComponentBase };