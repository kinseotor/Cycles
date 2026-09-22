import {
    Utility,
    Loader,
    Vector4,
    Matrix4x4,
    Camera,
    Node
} from '../../../Module.js'

class WebGPU {

    static topologyList = ['point-list','line-list','line-strip','triangle-list','triangle-strip']
    constructor ( config = {
        canvas: null,
        gpu: null,
        adapter: null,
        device:null,
        context:null,
        format:null,
        depthFormat:null,
    }) {
        this.canvas = config.canvas;
        this.gpu = config.gpu;
        this.adapter = config.adapter;
        this.device = config.device;
        this.context = config.context;
        this.format = config.format;
        this.depthFormat = config.depthFormat;

        this.aspect = this.canvas.width/this.canvas.height;
        this.viewScale = 1;
        
        this.backgroundColor = new Vector4( 1, 1, 1, 1 );
        this.camera = new Camera().setPerspective( 100, 1, 0.1, 1000 );
        // this.camera = new Camera().setOrthographic( 1/2, this.canvas.width/this.canvas.height, 0.1, 1000 );
        
        this.camera.update();
        // console.dir( this.camera )
        
        this.loader = new Loader({url:import.meta.url});
        this.sampleCount = 4;
        
        this.WebGPU_Resource = {
            UniformBuffers: {
                cameraMatrix4x4Buffer: null,
            },
            StorageBuffers: {
                modelMatrix4x4Array: null,
            },
            Samplers: {},
            TextureViews: {
                mainCamera: null,
                baseColor: null,
            }
        }
    }
    
    status = {
        isInited: false,
        isFirstDraw: true,
        loadOp: 'clear',
    }

    #count = {
        renderPipelineAsync: 0
    }

    Programs = {
        VertexUvNormal: { pipeline: null, shaderModule: null, }
    }
    static sampleCount = 4;

    async createPipeline(){
        this.updateHTMLCanvasElement();
        var shaderCode = await this.loader.readText( new URL('./wgsl/invoke/VertexUvNormal.wgsl',import.meta.url).href );
        var shaderModule = this.device.createShaderModule({ code: shaderCode,label:'VertexUvNormal' });
        this.Programs.VertexUvNormal.shaderModule = shaderModule;
        this.Programs.VertexUvNormal.pipeline = await this.device.createRenderPipelineAsync({
            label: `Transform WebGPU Engine Render Pipline${this.#count.renderPipelineAsync++}`,
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: "vsVertexUvNormal",
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x3"
                            }
                        ]
                    },
                    {
                        arrayStride: 2 * 4,
                        attributes: [
                            {
                                shaderLocation: 1,
                                offset: 0,
                                format: "float32x2"
                            },
                        ]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 2,
                                offset: 0,
                                format: "float32x3"
                            },
                        ]
                    },
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_BasicMaterial",
                targets: [
                    { 
                        format: this.format,
                        blend: {
                            color: {
                                srcFactor: 'src-alpha',           // 源颜色乘以源alpha
                                dstFactor: 'one-minus-src-alpha', // 目标颜色乘以(1-源alpha)
                                operation: 'add'                  // 相加
                            },
                            alpha: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha',
                                operation: 'add'
                            }
                        },
                        writeMask: GPUColorWrite.ALL  // 写入所有通道
                    }
                ]
            },
            primitive: {
                topology: WebGPU.topologyList[3],
                cullMode: 'back',
                // frontFace: 'cw' // 设定顺时针 = 正面
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less', // 进盖远
            },
            multisample: {
                count: this.sampleCount,
                mask: 0xFFFFFFFF,  // 所有采样点都写入
                alphaToCoverageEnabled: false
            }
        });
        this.status.isInited = true;
        this.initData();
        return true;
    }

    /*
        get data from scene
    */

    initData() {
        this.initStorageBuffer();
        this.initUniformBuffer();
        this.initBindGroup();
        this.updateBuffer();
    }

    setScene( scene ) {
        if ( scene.type === 'scene' ) console.warn('type error');
        this.scene = scene;
        
        this.storages = {
            Data: null,
            Buffers: {
                modelMatrixArray: null,
            }
        }
    }

    update() {
        if ( !this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array || (Node.StorageBuffers.WorldMatrix4x4Array.length * 4 !== this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array.size)) {
            this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array = this.device.createBuffer({
                size: Node.StorageBuffers.WorldMatrix4x4Array.length * 4,
                usage: 
                    GPUBufferUsage.STORAGE |
                    GPUBufferUsage.COPY_DST |
                    GPUBufferUsage.COPY_SRC,
                mappedAtCreation: false,
            });
        }
        if ( Node.status.hasChanges) {
            this.device.queue.writeBuffer( this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array, 0, new Float32Array(
                this.scene.Storagebuffers.ALL_NODE_WorldMatrix4x4
            ));
            this.Programs.VertexUvNormal.bindGroup1 = this.device.createBindGroup({
                label: 'Programs.VertexUvNormal.pipeline.bindGroup1',
                layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(1),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array,
                        }
                    }
                ]
            });
            Node.status.hasChanges = false;
        }
    }

    initStorageBuffer() {
        this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array = this.device.createBuffer({
            size: 64,
            usage: 
                GPUBufferUsage.STORAGE |
                GPUBufferUsage.COPY_DST |
                GPUBufferUsage.COPY_SRC,
            mappedAtCreation: false,
        });
    }

    initUniformBuffer() {
        this.WebGPU_Resource.UniformBuffers.cameraMatrix4Buffer = this.device.createBuffer({
            label: 'GPUBuffer store 4x4 matrix',
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer( this.WebGPU_Resource.UniformBuffers.cameraMatrix4Buffer, 0, new Float32Array( [
            ...this.camera.projectionMatrix4x4.element
        ]));
        
        this.WebGPU_Resource.Samplers.baseColor = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat'
        });

        const defaultTextures = this.device.createTexture({
            label: 'default-texture',
            size: [1, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        const defaultData = new Uint8Array([100, 255, 255, 255]);
        this.device.queue.writeTexture(
            { texture: defaultTextures },
            defaultData,
            { bytesPerRow: 4 },
            { width: 1, height: 1, }
        );
        this.WebGPU_Resource.TextureViews.baseColor = defaultTextures.createView();

        const imgs = [
            '/assets/images/nl.webp',
            '/assets/images/file-7iowdg9qpgxs.jpg',
            '/assets/kevin/NPC_Kevin_Body_Color.png',
            '/assets/images/ht.jpg',
            '/assets/images/uv_grid_opengl.jpg',
            '/assets/logos/webgpu.webp', // 5
            '/assets/pmx/ly/衣.png',
            '/assets/pmx/ly/髪.png',
            '/assets/pmx/ly/颜.png',
            '/assets/pmx/adt/tex/体.png',
            '/assets/pmx/zgn/衣.png', //10
            '/assets/pmx/zgn/颜.png',
        ]
        this.loader.loadImageBitmap(imgs[6]).then((img)=>{
            const texture = this.device.createTexture({
                label: 'texture',
                size: {
                    width: img.width,
                    height: img.height
                },
                // arrayLayerCount: 4,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | 
                    GPUTextureUsage.COPY_DST | 
                    GPUTextureUsage.RENDER_ATTACHMENT
            });
            
            this.device.queue.copyExternalImageToTexture(
                { source: img },
                { texture: texture },
                [img.width, img.height]
            );

            this.WebGPU_Resource.TextureViews.baseColor = texture.createView();

            this.Programs.VertexUvNormal.bindGroup3 = this.device.createBindGroup({
                label: 'Programs.VertexUvNormal.pipeline.bindGroup3',
                layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(3),
                entries: [
                    {
                        binding: 0,
                        resource: this.WebGPU_Resource.TextureViews.baseColor,
                    }
                ]
            });
        })
    }

    initBindLayout() {

    }
    
    initBindGroup() {
        this.Programs.VertexUvNormal.bindGroup0 = this.device.createBindGroup({
            label: 'Programs.VertexUvNormal.pipeline.bindGroup0',
            layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.WebGPU_Resource.UniformBuffers.cameraMatrix4Buffer,
                    }
                }
            ]
        })
        this.Programs.VertexUvNormal.bindGroup1 = this.device.createBindGroup({
            label: 'Programs.VertexUvNormal.pipeline.bindGroup1',
            layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.WebGPU_Resource.StorageBuffers.modelMatrix4x4Array,
                    }
                }
            ]
        })
        this.Programs.VertexUvNormal.bindGroup2 = this.device.createBindGroup({
            label: 'Programs.VertexUvNormal.pipeline.bindGroup2',
            layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: this.WebGPU_Resource.Samplers.baseColor,
                },
            ]
        });
        
        this.Programs.VertexUvNormal.bindGroup3 = this.device.createBindGroup({
            label: 'Programs.VertexUvNormal.pipeline.bindGroup3',
            layout: this.Programs.VertexUvNormal.pipeline.getBindGroupLayout(3),
            entries: [
                {
                    binding: 0,
                    resource: this.WebGPU_Resource.TextureViews.baseColor,
                }
            ]
        });
    }
    updateBuffer() {

    }

    drawGeometry( GeometryComponent ) {
        
        // if (this.status._) 
        this.drawGeometryByIndices( GeometryComponent );
        
        this.status.isFirstDraw = true;
    }

    drawGeometryByIndices( GeometryComponent ) { // 
        let encoder = this.device.createCommandEncoder();
        if ( this.status.isFirstDraw ) {
            this.status.loadOp = 'clear'
            this.status.isFirstDraw = false
        } else {
            this.status.loadOp = 'load'
        }
        
        const textureView = this.context.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.multisampleTextureView,
                resolveTarget: textureView,
                clearValue: this.backgroundColor.toArray(),
                loadOp: this.status.loadOp,
                storeOp:"store"
            }],

            depthStencilAttachment: {
                format: this.depthFormat,
                view: this.depthTextureView,
                depthLoadOp: this.status.loadOp,
                depthStoreOp: "store",
                depthClearValue: 1.0,
            }
        });

        pass.setViewport(
            0, 0,
            600, 600,
            0,1
        );
        // pass.setScissorRect(
        //     0, 0,
        //     600, 600,
        // );

        if ( GeometryComponent.need.updateWebGPUBuffer ) {
            GeometryComponent.updateAttribute();
            GeometryComponent.WebGPUBuffer.indicesBuffer = this.setUint16ArrayBuffer( GeometryComponent.attribute.indices );
            GeometryComponent.WebGPUBuffer.verticesBuffer = this.setFloat32ArrayBuffer( GeometryComponent.attribute.vertices );
            GeometryComponent.WebGPUBuffer.uvsBuffer = this.setFloat32ArrayBuffer( GeometryComponent.attribute.uvs );
            GeometryComponent.WebGPUBuffer.normalsBuffer = this.setFloat32ArrayBuffer( GeometryComponent.attribute.normals );
            GeometryComponent.need.updateWebGPUBuffer = false;
        }

        pass.setPipeline( this.Programs.VertexUvNormal.pipeline );
        pass.setBindGroup( 0, this.Programs.VertexUvNormal.bindGroup0 );
        pass.setBindGroup( 1, this.Programs.VertexUvNormal.bindGroup1 );
        pass.setBindGroup( 2, this.Programs.VertexUvNormal.bindGroup2 );
        pass.setBindGroup( 3, this.Programs.VertexUvNormal.bindGroup3 );

        pass.setIndexBuffer( GeometryComponent.WebGPUBuffer.indicesBuffer, 'uint16');
        
        pass.setVertexBuffer(0, GeometryComponent.WebGPUBuffer.verticesBuffer);
        pass.setVertexBuffer(1, GeometryComponent.WebGPUBuffer.uvsBuffer );
        pass.setVertexBuffer(2, GeometryComponent.WebGPUBuffer.normalsBuffer );

        pass.drawIndexed( GeometryComponent.attribute.indices.length, 1, 0, 0, 0);
        pass.end();
        this.device.queue.submit([ encoder.finish()]);
    }
    
    updateHTMLCanvasElement() {
        const depthTexture = this.createDepthTexture()
        this.depthTextureView = depthTexture.createView()

        const multisampleTexture = this.createMultisampleTexture()
        this.multisampleTextureView = multisampleTexture.createView()
    }
    
    createDepthTexture() {
        const depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            sampleCount: this.sampleCount,
            format: this.depthFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        return depthTexture;
    }
    
    createMultisampleTexture() {
        let multisampleTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            sampleCount: this.sampleCount,
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            label: 'multisample-color-texture'
        });
        return multisampleTexture;
    }
    
    setFloat32ArrayBuffer( array ) {
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
    
    setInt32ArrayBuffer( array ) {
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

    setUint16ArrayBuffer( array ) {
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

export { WebGPU }