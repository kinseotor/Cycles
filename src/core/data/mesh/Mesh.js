/**
 * @zh Mesh 内部定义一个Array<childrenMesh>
 */
class Mesh {
    
    DATA_TYPE = 'Mesh';
    _geometry = null;

    constructor( config = {} ) {
        this.status = {
            visible: true,
        };
    }

    set geometry( geometry ) {
        this._geometry = geometry;
    }

    get geometry() {
        return this._geometry;
    }

    childrenMeshList = []

    setChildrenMeshList( array ) { 
        if ( !Array.isArray(array) || array.length === 0 ) return;
        this.childrenMeshList.length = 0;
        for ( let i = 0; i < array.length; i++ ) {
            this.childrenMeshList.push( new childrenMesh( array[i]));
        }
        return this;
    }
}

/**
 * @zh childrenMesh定义对于一个几何体从哪个索引开始往后通过某种材质绘制多少个索引
 * @returns @en childrenMesh instance @zh childrenMesh实例。
 */
class childrenMesh {
    constructor( config = {} ) {

        this.property = {
            indexCount: 0,
            instanceCount: 1,
            firstIndex: 0,
        }

        if ( !config.indexCount ) this.property.indexCount = 0;
        if ( !config.instanceCount ) this.property.instanceCount = 1;
        if ( !config.firstIndex ) this.property.firstIndex = 0;

        this.status = {
            visible: true,
        };
    }

    set material( material ) {
        this._material = material;
    }


}

export { Mesh, childrenMesh }