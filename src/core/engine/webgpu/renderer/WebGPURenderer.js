import {
    Node,
    View,
    Texture2D,
    Loader,
    RenderPipeline,
    SkyBox,
    Material
} from "../../../../Module.js";

/**
 * WebGPU渲染器
 * 管理GPU资源、命令编码，维护绑定组布局，用于场景渲染
 *
 * ## BindGroup 布局约定
 * - group(0)
 *   - binding(0): 节点索引数据，支持动态偏移 buffer
 *   - binding(1): 材质数据，支持动态偏移 buffer
 * - group(1): 场景节点、组件存储缓冲区
 * - group(2): 场景采样器 + 纹理资源
 * - group(3): 预留，自定义功能扩展
 *
 * @class WebGPURenderer
 */

class WebGPURenderer {

    constructor() {

    }

    // rgba8unorm | bgra8unorm？
    static ENUM_CONFIG = {
        alphaMode: ['opaque','premultiplied'],
        depthFormat: ['depth24plus','depth32float','depth24plus-stencil8'],
        topologyType: ['point-list','line-list','line-strip','triangle-list','triangle-strip'],
        cullModeType: ["back","front","none"],
    }

    static config = {
        sampleCount: 4,
        TextureSize: 4096,
        DynamicOffset_SLOT_SIZE: 256, // ≥ minUniformBufferOffsetAlignment
        DynamicOffset: 4 * 4,
        DynamicOffset_Material: 4 * 51,
        DRAW_CALL_COUNT: 100,
        DRAW_CALL_INDEX: 0,

        alphaMode: this.ENUM_CONFIG.alphaMode[0],
        depthFormat: this.ENUM_CONFIG.depthFormat[0],
        topologyType: this.ENUM_CONFIG.topologyType[0],
        cullModeType: this.ENUM_CONFIG.cullModeType[0],
    }

    static renderQueue;

    static shaderCode = {
        default: null,
        skyBox: null,
    }
    static shaderModule = {
        default: null,
        skyBox: null,
    }
    
    static Pipelinelist = {
        // BasicMaterial: null,
        // BlinnPongMaterial: null,
        // CartoonMaterial: null,
        // NormalMaterial: null,
    }
    
    static BindGrouplayout = {
        _1: null,
        _2: null,
        _3: null,
        _4: null,
    }

    static Resource = {
        Uniform: {
            DynamicOffset_vertex: null
        },
        StorageBuffers: {
            WorldMatrix4x4Array: null,
            CameraViewMatrix4x4Array: null,
        },
        Samplers: {},
        Texture:{
            Texture2DArray: null,
        },
        TextureViews: {
            Texture2DArray: null,
        }
    }
    static status = {
        isInitGraphicsApied: false,
        isCreatePipelinesed: false,

        updateBindGroup: [
            true,
            true,
            true,
            true,
        ]
     }
    
    static async init() {
        if (!navigator.gpu) {
            console.warn('WebGPU is not supported on this browser');
            return WebGPURenderer.status.isInitGraphicsApied;
        }
    
        WebGPURenderer.gpu = navigator.gpu;
        WebGPURenderer.format = WebGPURenderer.gpu.getPreferredCanvasFormat();
        try {
            WebGPURenderer.adapter = await WebGPURenderer.gpu.requestAdapter({
                // powerPreference: 'high-performance',
                // powerPreference: 'low-power',
            });
            // const info = WebGPURenderer.adapter.info;
            // console.log("GPU信息：", info);
            if (!WebGPURenderer.adapter) {
                console.warn('Couldn’t request WebGPU adapter.');
                return WebGPURenderer.status.isInitGraphicsApied;
            }
            WebGPURenderer.device = await WebGPURenderer.adapter.requestDevice({
                // 我这个引擎必须要有这些硬件能力、内存限制，缺任意一项，直接拒绝创建 device
                requiredFeatures: [
                    "bgra8unorm-storage",        // BGRA8纹理可以作为存储纹理（storage texture），常用于后处理、离屏渲染。很多手机GPU默认不开放这个能力，需要显式申请
                    "depth-clip-control",        // 深度裁剪控制，可以关闭深度裁剪，实现超出远近裁剪面的几何体渲染，做阴影、天空、特效常用
                    "depth32float-stencil8",     // 32位浮点数深度 + 8位模板缓冲 合并纹理，高精度深度，做阴影、SSAO、复杂模板特效必备
                    "indirect-first-instance",   // 间接绘制支持first-instance。多实例间接渲染，批量渲染大量物体（草地、粒子），减少CPU提交开销，自研引擎优化利器
                    "rg11b10ufloat-renderable",  // 11/11/10 半浮点HDR颜色纹理，可直接渲染。用于HDR颜色缓冲，比RGBA16float省一半显存
                ],
                requiredLimits: {
                    minUniformBufferOffsetAlignment: 256,
                    maxStorageBufferBindingSize: this.adapter.limits.maxStorageBufferBindingSize
                }
            });
            WebGPURenderer.status.isInitGraphicsApi = true;
        } catch (error) {
            console.warn('WebGPU init reject:', error);
        }

        WebGPURenderer.shaderCode.default = await Loader.readText( new URL('../wgsl/WebGPURenderer.default.wgsl',import.meta.url).href );
        WebGPURenderer.shaderModule.default = WebGPURenderer.device.createShaderModule({ code: WebGPURenderer.shaderCode.default,label:'WebGPURenderer.default' });
        WebGPURenderer.shaderCode.skyBox = await Loader.readText( new URL('../wgsl/SkyBox.wgsl',import.meta.url).href );
        WebGPURenderer.shaderModule.skyBox = WebGPURenderer.device.createShaderModule({ code: WebGPURenderer.shaderCode.skyBox,label:'skyBox' });

        WebGPURenderer.initBindGrouplayout();

        return WebGPURenderer.status.isInitGraphicsApied;
    }

    static async createPipelines() {
        // skybox
        this.Pipelinelist.SkyBox = await RenderPipeline.createVertexUvNormalPipeline({
            label: 'SkyBox',
            vertexShaderModule: WebGPURenderer.shaderModule.skyBox,
            fragmentShaderModule: WebGPURenderer.shaderModule.skyBox,
            vs_name: 'vs',
            fs_name: 'fs',
            bindGroupLayouts: [
                WebGPURenderer.BindGrouplayout._0,
                WebGPURenderer.BindGrouplayout._1,
                WebGPURenderer.BindGrouplayout._2,
                SkyBox.bindGroupLayout,
            ],
            primitive: {
                topology: WebGPURenderer.ENUM_CONFIG.topologyType[3],
                cullMode: 'front', // "back" "front" "none"
                frontFace: 'ccw'
            },
            depthStencil: {
                format: WebGPURenderer.config.depthFormat,
                depthWriteEnabled: false,
                depthCompare: 'less-equal',
            },
            multisample: {
                count: WebGPURenderer.config.sampleCount,
                mask: 0xFFFFFFFF,
                alphaToCoverageEnabled: false
            }
        });

        // BasicMaterial
        this.Pipelinelist.BasicMaterial = await RenderPipeline.createVertexUvNormalPipeline({
            vertexShaderModule: WebGPURenderer.shaderModule.default,
            fragmentShaderModule: WebGPURenderer.shaderModule.default,
            vs_name: 'vs_VertexUvNormal',
            fs_name: 'fs_BasicMaterial',
            bindGroupLayouts: [
                WebGPURenderer.BindGrouplayout._0,
                WebGPURenderer.BindGrouplayout._1,
                WebGPURenderer.BindGrouplayout._2,
            ],
            primitive: {
                topology: WebGPURenderer.ENUM_CONFIG.topologyType[3],
                cullMode: 'back',
                frontFace: 'ccw'
            },
            depthStencil: {
                format: WebGPURenderer.config.depthFormat,
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            multisample: {
                count: WebGPURenderer.config.sampleCount,
                mask: 0xFFFFFFFF,
                alphaToCoverageEnabled: false
            }
        });

        // UI2D
        this.Pipelinelist.UI = await RenderPipeline.createVertexUvNormalPipeline({
            vertexShaderModule: WebGPURenderer.shaderModule.default,
            fragmentShaderModule: WebGPURenderer.shaderModule.default,
            vs_name: 'vs_VertexUvNormal',
            fs_name: 'fs_BasicMaterial',
            bindGroupLayouts: [
                WebGPURenderer.BindGrouplayout._0,
                WebGPURenderer.BindGrouplayout._1,
                WebGPURenderer.BindGrouplayout._2,
            ],
            primitive: {
                topology: WebGPURenderer.ENUM_CONFIG.topologyType[3],
                cullMode: 'back',
                frontFace: 'ccw'
            },
            depthStencil: {
                format: WebGPURenderer.config.depthFormat,
                depthWriteEnabled: false,
                depthCompare: 'less',
            },
            multisample: {
                count: WebGPURenderer.config.sampleCount,
                mask: 0xFFFFFFFF,
                alphaToCoverageEnabled: false
            }
        });
        
        // line
        this.Pipelinelist.Line = await RenderPipeline.createVertexUvNormalPipeline({
            vertexShaderModule: WebGPURenderer.shaderModule.default,
            fragmentShaderModule: WebGPURenderer.shaderModule.default,
            vs_name: 'vs_Line',
            fs_name: 'fs_Line',
            bindGroupLayouts: [
                WebGPURenderer.BindGrouplayout._0,
                WebGPURenderer.BindGrouplayout._1,
                WebGPURenderer.BindGrouplayout._2,
            ],
            primitive: {
                topology: WebGPURenderer.ENUM_CONFIG.topologyType[1],
                cullMode: 'back',
                frontFace: 'ccw'
            },
            depthStencil: {
                format: WebGPURenderer.config.depthFormat,
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            multisample: {
                count: WebGPURenderer.config.sampleCount,
                mask: 0xFFFFFFFF,
                alphaToCoverageEnabled: false
            }
        });
        WebGPURenderer.status.isCreatePipelinesed = true;
        this.initDataResource();
        return this;
    }

    static initBindGrouplayout() {
        WebGPURenderer.BindGrouplayout._0 = WebGPURenderer.device.createBindGroupLayout({
            label: "ubo-dynamic",
            entries:[
                {
                    binding:0,
                    visibility:GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type:"uniform",
                        dynamic: true,
                        hasDynamicOffset: true,
                        minBindingSize: WebGPURenderer.config.DynamicOffset_Material,   // 告诉 GPU 每个槽位至少读 16 字节
                    }
                },
                {
                    binding:1,
                    visibility:GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type:"uniform",
                        dynamic: true,
                        hasDynamicOffset: true,
                        minBindingSize: 240,
                    }
                },
            ]
        });
        WebGPURenderer.BindGrouplayout._1 = WebGPURenderer.device.createBindGroupLayout({
            entries: [
                {
                    binding:0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type:"read-only-storage"
                    }
                },
                {
                    binding:1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type:"read-only-storage"
                    }
                },
            ]
        });
        WebGPURenderer.BindGrouplayout._2 = WebGPURenderer.device.createBindGroupLayout({
            entries:[
                {
                    binding:0,
                    visibility:GPUShaderStage.FRAGMENT,
                    sampler: {
                        type:"filtering"
                    }
                },
                {
                    binding:1,
                    visibility:GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType:"float",
                        viewDimension:"2d-array"
                    }
                },
                {
                    binding:2,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type:"read-only-storage"
                    }
                },
            ]
        });
    }

    static initDataResource() {
        this.Resource.Uniform.DynamicOffset_vertex = this.device.createBuffer({
            label: 'ubo-dynamic',
            size: WebGPURenderer.config.DynamicOffset_SLOT_SIZE * WebGPURenderer.config.DRAW_CALL_COUNT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        this.Resource.Uniform.DynamicOffset_fragment = this.device.createBuffer({
            label: 'ubo-dynamic',
            size: WebGPURenderer.config.DynamicOffset_SLOT_SIZE * WebGPURenderer.config.DRAW_CALL_COUNT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // @group(1) @binding(0)
        this.Resource.Samplers.baseColor = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat'
        });
        // @group(1) @binding(1)
        this.Resource.Texture.Texture2DArray = this.device.createTexture({
            label: 'textureArray',
            format: 'rgba8unorm',
            mipLevelCount: 1,
            sampleCount: 1,
            dimension: "2d",
            size: {
                width: Texture2D.defaultWidth,
                height: Texture2D.defaultHeight,
                depthOrArrayLayers: Texture2D.defaultDepth
            },
            arrayLayerCount: Texture2D.defaultDepth,
            
            usage: GPUTextureUsage.TEXTURE_BINDING | 
                GPUTextureUsage.COPY_DST | 
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.Resource.TextureViews.Texture2DArray = this.Resource.Texture.Texture2DArray.createView({
            dimension: "2d-array",
            baseArrayLayer: 0,
            arrayLayerCount: Texture2D.defaultDepth,
            mipLevelCount: 1,
            baseMipLevel: 0
        });

        this.textureDataArray = new Float32Array(8*32).fill(0.0);
        this.Resource.StorageBuffers.textureDataArray = this.device.createBuffer({
            size: 8 * 32 * 4,
            usage: 
                GPUBufferUsage.STORAGE |
                GPUBufferUsage.COPY_DST |
                GPUBufferUsage.COPY_SRC,
            mappedAtCreation: false,
        });
        WebGPURenderer.device.queue.writeBuffer(
            this.Resource.StorageBuffers.textureDataArray,
            0,
            this.textureDataArray
        )
    }

    static writeTexture( source, z = 0, x = 0, y = 0, flipY = false ) {
        WebGPURenderer.device.queue.copyExternalImageToTexture(
            { source: source, flipY: flipY },
            {
                texture: this.Resource.Texture.Texture2DArray,
                mipLevel: 0,
                origin: { x: x, y: y, z: z },
            },
            {
                width: source.width,
                height: source.height,
                depthOrArrayLayers: 1
            }
        );
        this.textureDataArray[4 * 8 * z] = z;
        this.textureDataArray[4 * 8 * z + 4] = x;
        this.textureDataArray[4 * 8 * z + 5] = y;
        this.textureDataArray[4 * 8 * z + 6] = source.width/WebGPURenderer.config.TextureSize;
        this.textureDataArray[4 * 8 * z + 7] = source.height/WebGPURenderer.config.TextureSize;

        WebGPURenderer.device.queue.writeBuffer(
            this.Resource.StorageBuffers.textureDataArray,
            4 * 8 * z,
            new Float32Array([z,0,0,0,x,y,source.width/WebGPURenderer.config.TextureSize,source.height/WebGPURenderer.config.TextureSize])
        )
    }

    static updateDataResource() {
        // @group(0)
        View.update();
        if ( !this.Resource.StorageBuffers.CameraViewMatrix4x4Array || ( View.StorageBuffers.CameraViewMatrix4x4Array.length * 4 !== this.Resource.StorageBuffers.CameraViewMatrix4x4Array.size)) {
            this.Resource.StorageBuffers.CameraViewMatrix4x4Array = this.device.createBuffer({
                size: View.StorageBuffers.CameraViewMatrix4x4Array.length * 4,
                usage: 
                    GPUBufferUsage.STORAGE |
                    GPUBufferUsage.COPY_DST |
                    GPUBufferUsage.COPY_SRC,
                mappedAtCreation: false,
            });
            this.status.updateBindGroup[0] = true;
        }
        Node.update();
        if ( !this.Resource.StorageBuffers.WorldMatrix4x4Array || ( Node.StorageBuffers.WorldMatrix4x4Array.length * 4 !== this.Resource.StorageBuffers.WorldMatrix4x4Array.size)) {
            this.Resource.StorageBuffers.WorldMatrix4x4Array = this.device.createBuffer({
                size: Node.StorageBuffers.WorldMatrix4x4Array.length * 4,
                usage: 
                    GPUBufferUsage.STORAGE |
                    GPUBufferUsage.COPY_DST |
                    GPUBufferUsage.COPY_SRC,
                mappedAtCreation: false,
            });
            this.status.updateBindGroup[0] = true;
        }
    }

    static writeDataResource() {
        WebGPURenderer.device.queue.writeBuffer( WebGPURenderer.Resource.StorageBuffers.CameraViewMatrix4x4Array, 0, new Float32Array(
            View.StorageBuffers.CameraViewMatrix4x4Array
        ));
        WebGPURenderer.device.queue.writeBuffer( WebGPURenderer.Resource.StorageBuffers.WorldMatrix4x4Array, 0, new Float32Array(
            Node.StorageBuffers.WorldMatrix4x4Array
        ));
        // Texture2D.update();
    }

    static updateTextureArray(){
        
    }

    static updateBindGroup() {
        if ( this.status.updateBindGroup[0] ) {
            this.b0 = this.device.createBindGroup({
                label: 'ubo-dynamic',
                layout: WebGPURenderer.BindGrouplayout._0,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.Resource.Uniform.DynamicOffset_vertex,
                            offset: 0,
                            size: WebGPURenderer.config.DynamicOffset_SLOT_SIZE,   // ← 关键：一个槽位的大小
                        },
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: this.Resource.Uniform.DynamicOffset_fragment,
                            offset: 0,
                            size: WebGPURenderer.config.DynamicOffset_SLOT_SIZE,   // ← 关键：一个槽位的大小
                        },
                    },
                ]
            });
            this.status.updateBindGroup[0] = false;
        }

        if ( this.status.updateBindGroup[1] ) {
            this.b1 = this.device.createBindGroup({
                label: '',
                layout: WebGPURenderer.BindGrouplayout._1,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.Resource.StorageBuffers.WorldMatrix4x4Array,
                        }
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: this.Resource.StorageBuffers.CameraViewMatrix4x4Array,
                        }
                    },
                ]
            });
            this.status.updateBindGroup[1] = false;
        }
        if ( this.status.updateBindGroup[2] ) {
            this.b2 = this.device.createBindGroup({
                label: '',
                layout: WebGPURenderer.BindGrouplayout._2,
                entries: [
                    {
                        binding: 0,
                        resource: this.Resource.Samplers.baseColor,
                    },
                    {
                        binding: 1,
                        resource: this.Resource.TextureViews.Texture2DArray,
                    },
                    {
                        binding: 2,
                        resource: {
                            buffer: this.Resource.StorageBuffers.textureDataArray,
                        }
                    },
                ]
            });
            this.status.updateBindGroup[2] = false;
        }
        
    }

    static update() {
        if ( !WebGPURenderer.status.isCreatePipelinesed ) return false;
        WebGPURenderer.updateDataResource();
        WebGPURenderer.writeDataResource();
        WebGPURenderer.updateBindGroup();
        return true;
    }

    static draw( view, geometry, config = {} ) {
        if ( !WebGPURenderer.status.isCreatePipelinesed ) return;
        view.draw(geometry);
    }

    static render() {
        if ( !WebGPURenderer.update() ) return;
    }

    static _set() {
        var i = 0;
        WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_vertex, 256*i, new Uint32Array(
            [
                0, 3, 0, 0
            ]
        ));
        const mat = new Material();
        mat.pbr_baseColorTexture.x = 0
        WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_fragment, 256*i, new Float32Array(
            mat.toArray()
        ));
    }

    static drawMesh( mesh, view, node ) {
        if ( !mesh ) return;
        this.#set( mesh.geometry, view.pass, this.Pipelinelist.BasicMaterial, {} )
        for (let childrenMesh of mesh.childrenMeshList ) {
            if (childrenMesh.status.visibility) this.draw_indexed( view.pass, childrenMesh.property )
        }
    }

    static #set( geometry, pass, pipeline, renderConfig = {} ) {
        if ( geometry.need.updateWebGPUBuffer ) {
            this.updateGeometryBuffer( geometry );
        }

        if ( !renderConfig.offset || typeof renderConfig.offset !== 'number' ) renderConfig.offset = 0;

        pass.setPipeline( pipeline );
        pass.setBindGroup( 0, WebGPURenderer.b0, [ 256 * 0 , 0 ] );
        pass.setIndexBuffer( geometry.WebGPUBuffer.indicesBuffer, 'uint16');
        
        pass.setVertexBuffer(0, geometry.WebGPUBuffer.verticesBuffer);
        pass.setVertexBuffer(1, geometry.WebGPUBuffer.uvsBuffer );
        pass.setVertexBuffer(2, geometry.WebGPUBuffer.normalsBuffer );

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
    
    static updateSkinGeometryBuffer( geometry ) {
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

    static draw_indexed( pass, drawParameter = {} ) {
        if ( !pass ) return;
        if ( !drawParameter.indexCount || typeof drawParameter.indexCount !== 'number' ) drawParameter.indexCount = 0;
        if ( !drawParameter.instanceCount || typeof drawParameter.instanceCount !== 'number' ) drawParameter.instanceCount = 1;
        if ( !drawParameter.firstIndex || typeof drawParameter.firstIndex !== 'number' ) drawParameter.firstIndex = 0;
        if ( !drawParameter.offsetVertex || typeof drawParameter.offsetVertex !== 'number' ) drawParameter.offsetVertex = 0;
        if ( !drawParameter.firstInstance || typeof drawParameter.firstInstance !== 'number' ) drawParameter.firstInstance = 0;

        pass.drawIndexed(
            drawParameter.indexCount,
            drawParameter.instanceCount,
            drawParameter.firstIndex,
            drawParameter.offsetVertex,
            drawParameter.firstInstance
        );
    }
    
    static setFloat32ArrayBuffer( array ) {
        if ( array ) var vertices = new Float32Array( array );
        const vertexBuffer = this.device.createBuffer({
            label: 'GPUBuffer store vertex',
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array( vertexBuffer.getMappedRange() ).set(vertices);
        vertexBuffer.unmap();
        return vertexBuffer;
    }
    
    static setInt32ArrayBuffer( array ) {
        if ( array ) var vertices = new Int32Array( array );
        const vertexBuffer = this.device.createBuffer({
            label: 'GPUBuffer store vertex',
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Int32Array( vertexBuffer.getMappedRange() ).set(vertices);
        vertexBuffer.unmap();
        return vertexBuffer;
    }

    static setUint16ArrayBuffer( array ) {
        let indexData = new Uint16Array( array );
        let bufferSize = indexData.byteLength;
        if (bufferSize%4 !== 0 ) {
            bufferSize = Math.ceil(bufferSize/4)*4;
        }
        let indexBuffer = this.device.createBuffer({
            label: 'GPUBuffer store index',
            size: bufferSize,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Uint16Array( indexBuffer.getMappedRange()).set( indexData );
        indexBuffer.unmap();
        return indexBuffer;
    }
}

export { WebGPURenderer }