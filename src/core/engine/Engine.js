import {
    Vector4,
    Node,
    WebGPU,
} from "../../Module.js";
import { WebGPURenderer } from './webgpu/renderer/WebGPURenderer.js';

class Engine {
    constructor( config = {
        api:'webgpu',
        canvas: null,
    }) {
        if ( Object.prototype.toString.call(config.canvas) === '[object HTMLCanvasElement]' ) {
            this.AUTO_CREATE_CANVAS = false;
            this.canvas = config.canvas;
        } else {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'TF-Canvas'
            this.fullScreen();
            // this.autoFullScreen();
            document.body.appendChild( this.canvas );
        }

        this.canvas.V_msg = {
            _width: null,
            _height: null,
            needUpdataCameraMatrix4: true,
            needUpdataViewMatrix4: true,
        }
        if ( config.api !== 'webgl' ) this.api = 'webgpu'
        if ( config.api === 'webgl' ) this.api = 'webgl'
        this.backgroundColor = new Vector4( 0.0, 0.0, 0.0, 1.0 );

        this.configWebGPU = {
            alphaMode: ['opaque','premultiplied'][ 1 ],
        };
        
        this.status = {
            isInitGraphicsApi: false,
        }
    }

    initGraphicsApiAsync() { 
        return this.initWebGPU();
    }

    async initWebGPU() {
        if ( this.api !== 'webgpu' ) console.warn(`API 状态不合法:'${this.api}'`)
        if (!navigator.gpu) {
            console.warn('WebGPU is not supported on this browser');
            this.api = 'webgl'
            return;
        }
        
        this.gpu = navigator.gpu;
        this.format = this.gpu.getPreferredCanvasFormat(); // rgba8unorm / bgra8unorm？
        this.depthFormat = ['depth24plus','depth32float','depth24plus-stencil8'][0]
        
        // c.log(this.format);

        try {
            this.adapter = await this.gpu.requestAdapter();
            if (!this.adapter) {
                console.error('无法获取 WebGPU 适配器');
                this.api = 'webgl'
                return;
            }

            this.device = await this.adapter.requestDevice();

            this.context = this.canvas.getContext('webgpu');
            if (!this.context) {
                console.error('无法获取 WebGPU Canvas 上下文');
                this.api = 'webgl'
                return;
            }

            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: this.configWebGPU.alphaMode,
            });
            this.status.isInitGraphicsApi = true;
        } catch (error) {
            console.error('WebGPU 初始化失败:', error);
            this.api = 'webgl'
        }

        this.Backend = new WebGPU({
            canvas: this.canvas,
            gpu: this.gpu,
            adapter: this.adapter,
            device: this.device,
            context: this.context,
            format: this.format,
            depthFormat: this.depthFormat,
        });

        this.Backend.backgroundColor = this.backgroundColor;
        return this.status.isInitGraphicsApi;
    }
    
    autoFullScreen() {
        this.fullScreen();
        let timer;
        window.addEventListener("load", () => {
            window.addEventListener("resize", () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this.fullScreen();
                    // this.Backend.updateHTMLCanvasElement()
                }, 100);
            });
        });
    }
    
    fullScreen() {
        let i = window.devicePixelRatio
        this.canvas.height = window.innerHeight * 1;
        this.canvas.width = window.innerWidth * 1;
    }

    update() {
        this.Backend.update();
    }

    render() {
        
    }

    
    setScene( scene ) {
        if ( scene.type !== 'Scene' ) console.warn('type error');
        this.Backend.setScene( scene );
    }
}

export { Engine }