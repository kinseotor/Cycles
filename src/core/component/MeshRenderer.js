import { WebGPURenderer, Mesh, childrenMesh } from "../../Module.js";

/**
 * 静态网格渲染器。
 * 在场景中，依据指定相机视角、使用对应材质，提交网格的渲染绘制指令。
 * @class MeshRenderer
 * @remarks 仅管理渲染提交信息，不负责网格资源加载；属于场景渲染组件。
 */

class MeshRenderer {

    static status = {
        useWebGPU: true,
    }

    static drawMesh( mesh, node ) {
        if ( !mesh ) return;
        for (let childrenMesh of mesh.childrenMeshList ) {

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

    drawMesh( mesh, node ) {
        MeshRenderer.drawMesh( mesh, node )
    }
}

export { MeshRenderer }