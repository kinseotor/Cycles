import { WebGPURenderer } from "../../../../Module.js";

class RenderPipeline {
    static async createVertexUvNormalPipeline( config ) {
        if ( !config | typeof config !== 'object') config = {}

        config.label ??= '';
        config.vertexShaderModule ??= WebGPURenderer.shaderModule.default;
        config.fragmentShaderModule ??= WebGPURenderer.shaderModule.default;
        config.vs_name ??= 'vs'
        config.fs_name ??= 'fs'

        config.primitive ??= {
            topology: WebGPURenderer.config.topologyTypeList[3],
            cullMode: 'back',
            frontFace: 'ccw'
        };

        const op = {}
        if ( config.primitive ) op.primitive = config.primitive;
        if ( config.depthStencil ) op.depthStencil = config.depthStencil;
        if ( config.multisample ) op.multisample = config.multisample;

        config.depthStencil ??= {
            format: WebGPURenderer.depthFormat,
            depthWriteEnabled: true,
            depthCompare: 'less',
        };

        config.multisample ??= {
            count: WebGPURenderer.config.sampleCount,
            mask: 0xFFFFFFFF,
            alphaToCoverageEnabled: false
        };

        let pipelineLayout;
        if (Array.isArray(config.bindGroupLayouts)) {
            pipelineLayout = WebGPURenderer.device.createPipelineLayout({
                bindGroupLayouts: config.bindGroupLayouts,
            });
        } else {
            pipelineLayout = 'auto';
        }
        
        return await WebGPURenderer.device.createRenderPipelineAsync({
            label: config.label,
            layout: pipelineLayout,
            vertex: {
                module: config.vertexShaderModule,
                entryPoint: config.vs_name,
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
                module: config.fragmentShaderModule,
                entryPoint: config.fs_name,
                targets: [
                    { 
                        format: WebGPURenderer.format,
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
            ...op
        });
    }
}

export { RenderPipeline }