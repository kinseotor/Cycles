import { Matrix4x4,Node } from "../../Module.js";

class Scene {
    constructor() {
    }

    _type = 'Scene'
    get type() {
        return this._type;
    }
    /*
        ECS
    */
   // to WebGPU storage buffer
    Storagebuffers = {
        ALL_NODE_WorldMatrix4x4: [],
    }
    NodeArray = []; // Node array

    _RootNode = null; // root Node

    set RootNode( node ) {
        if ( node.type !== 'Node' && !node ) {
            console.warn('type error');
            return
        }
        // node.name = 'root';
        this._RootNode = node;
    }

    _updateArray_WorldMatrix4x4( rootNode ) {
        this.Storagebuffers.ALL_NODE_WorldMatrix4x4.length = 0;
        Node.recursionRootNode( rootNode, (node) => this.Storagebuffers.ALL_NODE_WorldMatrix4x4.push(...node.Matrices.worldMatrix4x4.element) )
    }

    updateNodeWorldMatrixAll( rootNode ) {
        Node.recursionRootNode( rootNode, Node.updateNodeWorldMatrix4x4 )
    }

    update() {
        if ( !this._RootNode ) return; 
        this.updateNodeWorldMatrixAll( this._RootNode );
        this._updateArray_WorldMatrix4x4( this._RootNode );
    }
}

export { Scene }