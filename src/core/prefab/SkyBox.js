import { WebGPURenderer, Cube, Vector1, Vector3, Vector4, Prefab } from "../../Module.js";
class SkyBox{
    static typeMenu = ['programCube', 'textureCube'];
    static cube = new Cube();

    static init() {
        this.cube.updateAttribute();
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
            size: 4*4*3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.property = {
            sunDir   : new Vector3( 1, 1, 1 ).normalize(),          // 太阳方向（单位向量）
            exposure : new Vector1(),                   // 暴露
            zenith   : new Vector4( 0, 0, 1, 1 ),       // 天顶色
            horizon  : new Vector4( 0.1, 0.1, 0.1, 1 ), // 地平线色
        }
        this.writeData();

        this.bindGroup = WebGPURenderer.device.createBindGroup({
                label: 'skybox',
                layout: SkyBox.bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.buffer,
                        },
                    }
                ]
        });
    }

    static writeData() {
        WebGPURenderer.device.queue.writeBuffer( SkyBox.buffer, 0, new Float32Array(
            [
                ...this.property.sunDir.toArray(),
                ...this.property.exposure.toArray(),
                ...this.property.zenith.toArray(),
                ...this.property.horizon.toArray(),
            ]
        ));
    }
}

export { SkyBox }