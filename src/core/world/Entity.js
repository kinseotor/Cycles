class Entity {
    constructor() {
        
    }

    _type = 'Entity3D';
    _id = -1;

    get type() {
        return this._type;
    }

    get id() {
        return ++this._id;
    }

    getComponent( _class ) {
        // component.__proto__.constructor = _class
    }
}

export { Entity }