import {
    ComponentBase,
    config,
    Vector4,
    Matrix4x4,
    Node,
    Camera,
    WebGPURenderer
} from "../../Module.js";

class View extends ComponentBase {

    static instance_index = 0;
    static INSTANCE_LIST = [];
    static StorageBuffers = {
        CameraViewMatrix4x4Array: [],
    };
    static updateStorageBuffers() {
        this.StorageBuffers.CameraViewMatrix4x4Array.length = 0;
        for (let instance of this.INSTANCE_LIST ) {
            instance.update();
            this.StorageBuffers.CameraViewMatrix4x4Array.push(...instance.cameraViewMatrix4x4.element);
        }
    }
    static update() {
        this.updateStorageBuffers();
    }
    
    static initCanvas( canvas ) {
        let context = null;
        if ( !canvas && canvas.toString() !== `[object HTMLCanvasElement]`) return context;
        if ( canvas && !canvas['__cycles__']) {
             canvas['__cycles__'] = {
                context: canvas.getContext('webgpu'),
                backgroundColor: new Vector4(0.2,0.2,0.2,1),
                depthTexture: null,
                multisampleTexture: null,
                status: {
                    isFirstDraw: true,
                }
            }
            canvas['__cycles__'].context.configure({
                device: WebGPURenderer.device,
                format: WebGPURenderer.format,
                alphaMode: WebGPURenderer.config.alphaMode,
            });
            context = canvas['__cycles__'].context;
            this.setCanvasSize( canvas );
        } else if ( canvas['__cycles__']) {
            context = canvas['__cycles__'].context;
        }
        return context;
    }

    static setCanvasSize( canvas, width = 300, height = 300 ) {
        if ( !canvas && canvas.toString() !== `[object HTMLCanvasElement]`) return;
        width = Math.floor(width);
        height = Math.floor(height);
        if (width === canvas.width && height === canvas.height) return
        canvas.width = width;
        canvas.height = height;

        canvas['__cycles__'].depthTexture = WebGPURenderer.device.createTexture({
            size: [ canvas.width, canvas.height],
            sampleCount: WebGPURenderer.config.sampleCount,
            format: WebGPURenderer.depthFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        canvas['__cycles__'].depthTextureView = canvas['__cycles__'].depthTexture.createView()

        canvas['__cycles__'].multisampleTexture = WebGPURenderer.device.createTexture({
            size: [ canvas.width, canvas.height],
            sampleCount: WebGPURenderer.config.sampleCount,
            format: WebGPURenderer.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            label: 'multisample-color-texture'
        });
        canvas['__cycles__'].multisampleTextureView = canvas['__cycles__'].multisampleTexture.createView()
    }

    static createCommandEncoder() {
        this.encoder = WebGPURenderer.device.createCommandEncoder();
        canvas['__cycles__'].canvasTextureView = canvas['__cycles__'].context.getCurrentTexture().createView()
    }

    static clearColor( canvas ) {
        const pass = this.encoder.beginRenderPass({
            colorAttachments: [{
                view: canvas['__cycles__'].multisampleTextureView,
                resolveTarget: canvas['__cycles__'].canvasTextureView,
                clearValue: canvas['__cycles__'].backgroundColor.toArray(),
                loadOp: 'clear',
                storeOp:"store"
            }],

            depthStencilAttachment: {
                format: WebGPURenderer.depthFormat,
                view: canvas['__cycles__'].depthTextureView,
                depthLoadOp: 'clear',
                depthStoreOp: "store",
                depthClearValue: 1.0,
            }
        });
        pass.end();
    }

    static submitCommandEncoder() {
        WebGPURenderer.device.queue.submit([ this.encoder.finish()]);
    }
    
    constructor( config = { canvas: null, camera: null, node:null }) {
        super();
        if ( !config.canvas ) {
            console.warn('')
            return;
        } else {
            this.canvas = config.canvas;
            this.context = View.initCanvas(this.canvas)
        }
        if ( !config.camera || this.camera instanceof Camera ) {
            this.camera = new Camera();
        } else {
            this.camera = config.camera;
        }
        if ( config.node && config.node instanceof Node ) {
            this.setNode( config.node );
        }
        this.x = 0;
        this.y = 0;
        this.width = 300;
        this.height = 300;

        this._type = 'View';
        this.backgroundColor = new Vector4( 0.2, 0.2, 0.2, 0.0 );
        this.viewPort = new Vector4( this.x, this.y, this.width, this.height );
        this.scissorRect = new Vector4( this.x, this.y, this.canvas.width, this.canvas.height );
        this.viewMatrix4x4 = new Matrix4x4();
        this.cameraViewMatrix4x4 = new Matrix4x4();
        this.instance_index = View.instance_index++;
        View.add(this);

        this.status = {
            isFirstDraw: true,
            loadOp: 'clear', // ['clear','load']
            enableScissorRect: false,
        }
    }
    #node = null;
    setNode( node ) {
        if (!node instanceof Node) return;
        node.status.needInverseWorldMatrix4x4 = true;
        this.#node = node;
    }

    updateCamera() {
        if ( this.viewPort.status.needUpdate || this.camera.status.needUpdateProjectionMatrix4x4 ) {
            this.camera.aspect = this.viewPort.z/this.viewPort.w;
            if ( this.camera.type === 'Orthographic') this.camera.orthoSize = this.viewPort.w/2;
            this.camera.update();
            this.viewPort.status.needUpdate = false;
        }
    }

    update() {
        this.updateCamera();
        if ( this.#node ) {
            this.viewMatrix4x4 = this.#node.Matrices.inverseWorldMatrix4x4;
        }
        if ( this.camera.status.hasChangeProjectionMatrix4x4 || this.#node.status.hasChangeWorldMatrix4x4) {
        // console.log(1)
            this.cameraViewMatrix4x4.element = Matrix4x4.multiply(this.viewMatrix4x4.element, this.camera.projectionMatrix4x4.element )
            this.camera.status.hasChangeProjectionMatrix4x4 = false;
        }
    }

    createLoadRenderPass() {
        
        this.pass = View.encoder.beginRenderPass({
            colorAttachments: [{
                view: this.canvas['__cycles__'].multisampleTextureView,
                resolveTarget: this.canvas['__cycles__'].canvasTextureView,
                clearValue: this.canvas['__cycles__'].backgroundColor.toArray(),
                loadOp: 'load',
                storeOp:"store"
            }],

            depthStencilAttachment: {
                format: WebGPURenderer.depthFormat,
                view: this.canvas['__cycles__'].depthTextureView,
                depthLoadOp: 'load',
                depthStoreOp: "store",
                depthClearValue: 1.0,
            }
        });
        this.pass.setViewport(
            ...this.viewPort.toArray(),
            0,1
        );

        if ( this.status.enableScissorRect ) {
            this.pass.setScissorRect(
                ...this.scissorRect.toArray()
            );
        }

        this.pass.setBindGroup( 1, WebGPURenderer.b1 );
        this.pass.setBindGroup( 2, WebGPURenderer.b2 );
    }

    end() {
        this.pass.end();
    }
    
    drawGeometry(
        Pipeline = WebGPURenderer.Pipelinelist.BasicMaterial,
        geometry,
        renderConfig = {},
        drawConfig = {} ) {

        if ( !renderConfig.offset ) renderConfig.offset = 0;

        if ( !drawConfig.instanceCount ) drawConfig.instanceCount = 1;
        if ( !drawConfig.indexCount ) drawConfig.indexCount = geometry.attribute.indices.length;
        if ( !drawConfig.firstIndex ) drawConfig.firstIndex = 0;

        if ( geometry.need.updateWebGPUBuffer ) {
            geometry.updateAttribute();
            geometry.WebGPUBuffer.indicesBuffer = WebGPURenderer.setUint16ArrayBuffer( geometry.attribute.indices );
            geometry.WebGPUBuffer.verticesBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.vertices );
            geometry.WebGPUBuffer.uvsBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.uvs );
            geometry.WebGPUBuffer.normalsBuffer = WebGPURenderer.setFloat32ArrayBuffer( geometry.attribute.normals );
            geometry.need.updateWebGPUBuffer = false;
        }

        this.pass.setPipeline( Pipeline );
        this.pass.setBindGroup( 0, WebGPURenderer.b0, [ renderConfig.offset ] );
        this.pass.setIndexBuffer( geometry.WebGPUBuffer.indicesBuffer, 'uint16');
        
        this.pass.setVertexBuffer(0, geometry.WebGPUBuffer.verticesBuffer);
        this.pass.setVertexBuffer(1, geometry.WebGPUBuffer.uvsBuffer );
        this.pass.setVertexBuffer(2, geometry.WebGPUBuffer.normalsBuffer );

        this.pass.drawIndexed(
            drawConfig.indexCount,
            drawConfig.instanceCount,
            drawConfig.firstIndex, 0, 0);

    }

}

export { View }