import { WebGPURenderer, Cube, Vector1, Vector3, Prefab } from "../../Module.js";
class SkyBox{
    static typeMenu = ['programCube', 'textureCube'];
    static cube = new Cube();

    static init() {
        this._type = SkyBox.typeMenu[0];
        this.bindGroupLayout = WebGPURenderer.device.createBindGroupLayout({
            label: "skybox",
            entries:[
                {
                    binding:0,
                    visibility:GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type:"uniform",
                    }
                },
            ]
        });
        this.buffer = WebGPURenderer.device.createBuffer({
            label: "skybox",
            size: 4*4*2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.property = {
            sunDir   : new Vector3( 1, 1, 1 ).normalize(),                   // 太阳方向（单位向量）
            exposure : new Vector1(),                   // 暴露
            zenith   : new Vector3( 0, 0, 1, 1 ),       // 天顶色
            horizon  : new Vector3( 0.1, 0.1, 0.1, 1 ), // 地平线色
        }
    }

    static writeData() {

    }
}

export { SkyBox }