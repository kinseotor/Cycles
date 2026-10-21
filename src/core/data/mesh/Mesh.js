/**
 * @zh Mesh 内部定义一个Array<childrenMesh>
 */
class Mesh {

    DATA_TYPE = 'Mesh';
    _geometry = null;

    constructor(config = {}) {
        this.status = {
            visible: true,
        };
        this.childrenMeshList = [];
    }

    set geometry(geometry) {
        this._geometry = geometry;
        this.childrenMeshList.length = 0;
        this.childrenMeshList.push(new childrenMesh({
            property: {
                indexCount: geometry.attribute.indices.length,
                firstIndex: 0
            },
            status: {
                visibility: true,
            }
        }));
    }

    get geometry() {
        return this._geometry;
    }

    /**
     * @zh childrenMesh构造配置对象
     */
    setChildrenMeshList(array) {
        if (!Array.isArray(array) || array.length === 0) return;
        this.childrenMeshList.length = 0;
        for (let i = 0; i < array.length; i++) {
            this.childrenMeshList.push(new childrenMesh(array[i]));
        }
        return this;
    }
}

/**
 * @zh childrenMesh定义对于一个几何体从哪个索引开始往后通过某种材质绘制多少个索引
 * @returns @en childrenMesh instance @zh childrenMesh实例。
 */
class childrenMesh {
    constructor(config = {}) {

        this.property = {
            indexCount: 0,
            instanceCount: 1,
            firstIndex: 0,
        }
        this.status = {
            visibility: true,
        };

        if (!config.property.indexCount) {
            this.property.indexCount = 0;
        } else if ( typeof config.property.indexCount === 'number' ) {
            this.property.indexCount = config.property.indexCount;
        }

        if (!config.property.instanceCount) {
            this.property.instanceCount = 1;
        } else if ( typeof config.property.instanceCount === 'number' ) {
            this.property.instanceCount = config.property.instanceCount;
        }

        if (!config.property.firstIndex) {
            this.property.firstIndex = 0;
        } else if ( typeof config.property.firstIndex === 'number' ) {
            this.property.firstIndex = config.property.firstIndex;
        }

        this.status.visibility = config.status.visibility;
    }

    set material(material) {
        this._material = material;
    }


}

export { Mesh, childrenMesh }