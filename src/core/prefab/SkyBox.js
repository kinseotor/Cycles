import { WebGPURenderer, Cube, Vector1, Vector3, Vector4, Prefab } from "../../Module.js";
class SkyBox{
    static typeMenu = ['programCube', 'textureCube'];
    static geometry = new Cube();

    static init() {
        this.radius = 100;
        this.geometry.setShape( this.radius, this.radius, this.radius );
        
        this.geometry.updateAttribute();
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

        const day    = { zenith: [0.05, 0.15, 0.45], horizon: [0.55, 0.70, 0.85] };
        const sunset = { zenith: [0.08, 0.10, 0.25], horizon: [0.95, 0.45, 0.15] };

        this.property = {
            sunDir   : new Vector3( 0, 0.5, -1).normalize(), // 0.3, 0.7, 0.2
            exposure : new Vector1(1.5),
            zenith   : new Vector4(0.05, 0.15, 0.45, 1),
            horizon  : new Vector4(0.55, 0.70, 0.85, 1),
        };
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