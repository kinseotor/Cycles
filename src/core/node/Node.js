import {
    Vector3,
    Matrix3x3,
    Matrix4x4
} from "../../Module.js"

class Node {

    static status = {
        needUpdate_Data: true,
        needUpdate_Length: true,
    }
    static INSTANCE_INDEX = 0;
    static INSTANCE_LIST = [];
    static StorageBuffers = {
        WorldMatrix4x4Array: [],
        NormalMatrix3x3Array: [],
    };


    static updateStorageBuffers() {
        this.StorageBuffers.WorldMatrix4x4Array.length = 0;
        // this.StorageBuffers.NormalMatrix3x3Array.length = 0;
        for (let instance of this.INSTANCE_LIST ) {
            this.StorageBuffers.WorldMatrix4x4Array.push(...instance.Matrices.worldMatrix4x4.element);
            // this.StorageBuffers.NormalMatrix3x3Array.push(...instance.Matrices.normalMatrix3x3.element);
            instance.status.hasChangeWorldMatrix4x4 = false;
        }
    }

    static getUniformLocation( instance ) {
        let result = null;
        if ( instance && instance instanceof this ) {
            result = this.INSTANCE_LIST.indexOf( instance );
        }
        return result;
    }

    static add( instance ) {
        if ( instance.__proto__.constructor === Node && Node.getUniformLocation( instance ) < 0 ) {
            Node.INSTANCE_LIST.push(instance);
        } else {
            console.warn('!type')
        }
    }
    
    // 递归根节点为每个节点做某件事
    static recursionRootNode( rootNode, call ) {
        if ( !rootNode || !rootNode instanceof Node || typeof call !== 'function' ) return;
            call( rootNode );
        for (let node of rootNode.children) {
            this.recursionRootNode( node, call )
        }
    }

    static updateNodeWorldMatrix4x4( instance ) {
        if ( !instance || !instance instanceof Node ) {
            console.warn('!instance')
            return;
        }
        if ( instance.needUpdateModelMatrix4x4() ) {
            instance.updateModelMatrix4x4();
        }
        if ( instance.parent && instance.parent instanceof Node ) {
            instance.Matrices.worldMatrix4x4.element = Matrix4x4.multiply(instance.Matrices.modelMatrix4.element, instance.parent.Matrices.worldMatrix4x4.element);
            instance.status.hasChangeWorldMatrix4x4 = true;
        } else {
            instance.Matrices.worldMatrix4x4.element = instance.Matrices.modelMatrix4.element;
            instance.status.hasChangeWorldMatrix4x4 = true;
        }
        
        if ( instance.status.needInverseWorldMatrix4x4 ){
            instance.Matrices.inverseWorldMatrix4x4.element = Matrix4x4.inverse( instance.Matrices.worldMatrix4x4.element );
        }
    }

    static update() {
        this.updateStorageBuffers();
    }

    constructor( config = {} ) {
        this.name = 'node.' + Node.INSTANCE_INDEX++;

        this.scale = new Vector3( 1, 1, 1 );
        this.rotation = new Vector3();
        this.position = new Vector3();

        this.Matrices = {
            scaleMatrix4: new Matrix4x4(),
            rotationMatrix4: new Matrix4x4(),
            positionMatrix4: new Matrix4x4(),
            modelMatrix4: new Matrix4x4(),
            worldMatrix4x4: new Matrix4x4(),
            normalMatrix3x3: new Matrix3x3(),
            inverseWorldMatrix4x4: new Matrix4x4(),
        }
        
        this.children = []; // Array<Node>
        this.parent = null; // Node

        this._type = 'Node'
        this.label = '';

        Node.add(this)
    }

    status = {
        hasChangeWorldMatrix4x4: false,
        
        needInverseWorldMatrix4x4: false,
        needNormalMatrix3x3: false,

        needUpdateChildWorldMatrix4x4: true,
        isRootNode: true,
    }

    get type() {
        return this._type;
    }

    removeChild(...nodes) { // Node -> this
        for ( const node of nodes ) {
            const index = this.children.indexOf(node);
            if (index > -1) {
                node.status.isRootNode = true;
                node.parent = null;
                this.children.splice(index, 1);
            }
        }
        return this;
    }

    removeSelfInParent() { // -> this
        if (!this.parent || this.parent.type !== 'Node' ) return;
        this.parent.removeChild(this);
        return this;
    }

    addChild(...nodes) { // Node -> this
        for ( const node of nodes ) {
            if ( !node ) continue;
            node.removeSelfInParent();
            node.parent = this;
            this.children.push( node );
            node.status.isRootNode = false;
        }
        return this;
    }

    needUpdateModelMatrix4x4() { // -> boolean
        return (
            this.scale?.status?.needUpdate ||
            this.rotation?.status?.needUpdate ||
            this.position?.status?.needUpdate
        );
    }

    updateModelMatrix4x4() { // -> this
        if ( this.needUpdateModelMatrix4x4() ) {
            if ( this.scale.status.needUpdate ) {
                this.Matrices.scaleMatrix4.setScale( this.scale.x, this.scale.y, this.scale.z  );
                this.scale.status.needUpdate = false;
            }
            if ( this.rotation.status.needUpdate ) {
                this.Matrices.rotationMatrix4.setEuler( this.rotation.x, this.rotation.y, this.rotation.z );
                this.rotation.status.needUpdate = false;
            }
            if ( this.position.status.needUpdate ) {
                this.Matrices.positionMatrix4.setPosition( this.position.x, this.position.y, this.position.z );
                this.position.status.needUpdate = false;
            }
            this.Matrices.modelMatrix4.element = Matrix4x4.multiply(Matrix4x4.multiply(this.Matrices.scaleMatrix4.element, this.Matrices.rotationMatrix4.element), this.Matrices.positionMatrix4.element);
            this.status.updateChildworldMatrix4x4 = true;
            this.status.hasChangeWorldMatrix4x4 = true;
            Node.status.hasChanges = true;
        }
        return this;
    }

    getInParentIndex() {
        let result = null;
        if ( this.parent && this.parent.type === 'Node' ) {
            result = this.parent.children.indexOf( this );
        }
        return result;
    }
}

export { Node }