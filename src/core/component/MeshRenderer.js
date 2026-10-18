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

    drawMesh( mesh, view, node ) {
        if (MeshRenderer.status.useWebGPU) WebGPURenderer.drawMesh( mesh, view, node )
    }
}

export { MeshRenderer }