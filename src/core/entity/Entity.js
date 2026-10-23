/**
 * 定义一个索引数据集合，
 */
class Entity {
    constructor() {
        
        this.meshes = [];
        this.i_material = -1;
    }

    _type = 'Entity3D';
    static _id = -1;

    get type() {
        return this._type;
    }

    get id() {
        return ++ Entity._id;
    }

    getComponent( _class ) {
        // component.__proto__.constructor = _class
    }

}

export { Entity }