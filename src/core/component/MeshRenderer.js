import { WebGPURenderer, Mesh, childrenMesh } from "../../Module.js";

/**
 * 静态网格渲染器。
 * 在场景中，依据指定相机视角、使用对应材质，提交网格的渲染绘制指令。
 * @class MeshRenderer
 * @remarks 仅管理渲染提交信息，不负责网格资源加载；属于场景渲染组件。
 */
class MeshRenderer {

    static __webgpu__ = {
        DynamicOffset_SLOT_1: [], // vertex
        DynamicOffset_SLOT_2: [], // material
    }

    static render( mesh, node ) {
        if ( !mesh ) return;
        for (let childrenMesh of mesh.childrenMeshList ) {

        }
    }

    static updateGeometryBuffer( geometry ) {
        if ( !geometry ) return;
        if ( geometry.need.updateWebGPUBuffer ) {
            geometry.updateAttribute();
            geometry.WebGPUBuffer.indicesBuffer = WebGPURenderer.setUint16ArrayBuffer( geometry.attribute.indices );
            geometry.WebGPUBuffer.verticesBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.vertices );
            geometry.WebGPUBuffer.uvsBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.uvs );
            geometry.WebGPUBuffer.normalsBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.normals );
            geometry.need.updateWebGPUBuffer = false;
        }
    }
    static _() {
        if ( geometry.need.updateWebGPUBuffer ) {
            this.updateGeometryBuffer( geometry );
        }

        view.pass.setPipeline( Pipeline );
        view.pass.setBindGroup( 0, WebGPURenderer.b0, [ renderConfig.offset ] );
        view.pass.setIndexBuffer( geometry.WebGPUBuffer.indicesBuffer, 'uint16');
        
        view.pass.setVertexBuffer(0, geometry.WebGPUBuffer.verticesBuffer);
        view.pass.setVertexBuffer(1, geometry.WebGPUBuffer.uvsBuffer );
        view.pass.setVertexBuffer(2, geometry.WebGPUBuffer.normalsBuffer );

        if ( !renderConfig.offset || typeof renderConfig.offset !== 'number' ) renderConfig.offset = 0;
    }

    static set__webgpu__Parameters(array) {
        if ( !Array.isArray(array) ) {

        }
    }
}

export { MeshRenderer }