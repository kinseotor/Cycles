import { SkinGeometry } from '../Module.js'

class GLTFLoader {

    static COMPONENT_TYPE = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5125: Uint32Array,
        5126: Float32Array
    };

    static TYPE_SIZE = {
        SCALAR: 1,
        VEC2: 2,
        VEC3: 3,
        VEC4: 4,
        MAT4: 16
    };

    constructor() {

    }
    
    async readArrayBuffer( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const buffer = await response.arrayBuffer();
                file = buffer;
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file
    }

    async loadGLB( url ) {
        if (!url) throw new Error('URL is required');
        const arrayBuffer = await this.readArrayBuffer( url );
        return this.parseGLB( arrayBuffer );
    }

    /**
     * arrayBuffer
     * gltf object || bin 
     * gltf.meshes[i].primitives[j].attributes
     *      -> POSITION
     *      -> TEXCOORD_0
     *      -> NORMAL
     *      -> WEIGHTS_0
     *      -> JOINTS_0
     * gltf.accessors[i]
     * gltf.bufferViews
     */
    parseGLB( arrayBuffer ) {
        const geometry = new SkinGeometry();
        const model = {};
        const dataView = new DataView(arrayBuffer);
        let offset = 0;

        // 头部
        model.magic = String.fromCharCode(
            dataView.getUint8(offset++), dataView.getUint8(offset++),
            dataView.getUint8(offset++), dataView.getUint8(offset++)
        );
        if (model.magic !== 'glTF') throw new Error('不是有效的 GLB 文件');

        model.version = dataView.getUint32(offset, true); offset += 4;
        model.length  = dataView.getUint32(offset, true); offset += 4;
        if (model.version !== 2) throw new Error('仅支持 glTF 2.0');

        // JSON 块
        model.jsonChunkLength = dataView.getUint32(offset, true); offset += 4;
        model.jsonChunkType   = dataView.getUint32(offset, true); offset += 4;
        if (model.jsonChunkType !== 0x4E4F534A) throw new Error('JSON 块类型错误');

        const jsonBytes = new Uint8Array(arrayBuffer, offset, model.jsonChunkLength);
        model.gltf = JSON.parse(new TextDecoder('utf-8').decode(jsonBytes));
        offset += model.jsonChunkLength;

        // BIN 块（可选）
        if (offset < arrayBuffer.byteLength) {
            const binChunkLength = dataView.getUint32(offset, true); offset += 4;
            const binChunkType   = dataView.getUint32(offset, true); offset += 4;
            if (binChunkType === 0x004E4942) {
                model.binChunkData = arrayBuffer.slice(offset, offset + binChunkLength);
            }
        }

        for (const mesh of model.gltf.meshes) {
            for (const primitive of mesh.primitives) {
                
                const attrs = primitive.attributes;

                geometry.attribute.vertices.push(...this.readAccessor( attrs.POSITION, model.gltf, model.binChunkData ));
                geometry.attribute.normals.push(...attrs.NORMAL  ? this.readAccessor(attrs.NORMAL, model.gltf, model.binChunkData )  : null);
                geometry.attribute.uvs.push(...attrs.TEXCOORD_0 ? this.readAccessor(attrs.TEXCOORD_0, model.gltf, model.binChunkData ) : null);
                // geometry.attribute.colors.push(attrs.COLOR_0 ? this.readAccessor(attrs.COLOR_0, model.gltf, model.binChunkData ) : null);

                // 蒙皮数据（VRM 一定有）
                // const joints  = attrs.JOINTS_0  ? this.readAccessor(attrs.JOINTS_0, model.gltf, model.binChunkData )  : null; // 每顶点 4 个关节索引
                // const weights = attrs.WEIGHTS_0 ? this.readAccessor(attrs.WEIGHTS_0, model.gltf, model.binChunkData ) : null; // 对应的权重

                // 索引数据（决定三角形怎么连）
                geometry.attribute.indices.push(...primitive.indices !== undefined
                    ? this.readAccessor(primitive.indices, model.gltf, model.binChunkData )
                : null); // 没有 indices 时按顺序绘制

                const vertexCount = model.gltf.accessors[attrs.POSITION].count;

            }
        }

        model.geometry = geometry;
        return model;
    }

    readAccessor( accessorIndex, gltf, bin ) {
        const accessor = gltf.accessors[accessorIndex];
        const bufferView = gltf.bufferViews[accessor.bufferView];

        const ArrayType = GLTFLoader.COMPONENT_TYPE[accessor.componentType];
        const numComp = GLTFLoader.TYPE_SIZE[accessor.type];

        const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
        const stride = bufferView.byteStride; // 可能 undefined

        // 非交错数据：可以直接整段读取，性能最好
        if (!stride || stride === numComp * ArrayType.BYTES_PER_ELEMENT) {
            return new ArrayType( bin, byteOffset, accessor.count * numComp);
        }

        // 交错数据：逐元素跳着读
        const out = new ArrayType(accessor.count * numComp);
        for (let i = 0; i < accessor.count; i++) {
            const src = byteOffset + i * stride;
            const slice = new ArrayType( bin, src, numComp);
            out.set(slice, i * numComp);
        }
        return out;
    }
}

export { GLTFLoader }