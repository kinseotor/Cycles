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
    
    async load( url, call ) {
        if (!url) throw new Error('URL is required');
        const lower = url.toLowerCase();
        let model = null;
        if (lower.endsWith('.glb')|lower.endsWith('.vrm')) {
            const arrayBuffer = await this.readArrayBuffer( url );
            model = await this.parseGLB( arrayBuffer );
        }
        if ( typeof call === 'function' ) {
            call( model );
        }
        return model;
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

    parse() {
        if (lower.endsWith('.gltf')) {

        }
    }

    async parseGLB( arrayBuffer ) {
        const model = {};
        const dataView = new DataView(arrayBuffer);
        let offset = 0;

        model.magic = String.fromCharCode(
            dataView.getUint8(offset++), dataView.getUint8(offset++),
            dataView.getUint8(offset++), dataView.getUint8(offset++)
        );
        if (model.magic !== 'glTF') throw new Error('不是有效的 GLB 文件');

        model.version = dataView.getUint32(offset, true); offset += 4;
        model.length  = dataView.getUint32(offset, true); offset += 4;
        if (model.version !== 2) throw new Error('仅支持 glTF 2.0');

        model.jsonChunkLength = dataView.getUint32(offset, true); offset += 4;
        model.jsonChunkType   = dataView.getUint32(offset, true); offset += 4;
        if (model.jsonChunkType !== 0x4E4F534A) throw new Error('JSON type error');

        const jsonBytes = new Uint8Array(arrayBuffer, offset, model.jsonChunkLength);
        model.gltf = JSON.parse(new TextDecoder('utf-8').decode(jsonBytes));
        offset += model.jsonChunkLength;

        if (offset < arrayBuffer.byteLength) {
            const binChunkLength = dataView.getUint32(offset, true); offset += 4;
            const binChunkType   = dataView.getUint32(offset, true); offset += 4;
            if (binChunkType === 0x004E4942) {
                model.bin = arrayBuffer.slice(offset, offset + binChunkLength);
            }
        }

        this.parseGLTF(model.gltf, model.bin)

        return model;
    }

    async parseGLTF( gltf, bin ) {
        for (const mesh of gltf.meshes) {
            for (const primitive of mesh.primitives) {
                
                const attrs = primitive.attributes;

                const positions = this.readAccessor( attrs.POSITION, gltf, bin );
                const normals   = attrs.NORMAL  ? this.readAccessor(attrs.NORMAL, gltf, bin )  : null;
                const uvs       = attrs.TEXCOORD_0 ? this.readAccessor(attrs.TEXCOORD_0, gltf, bin ) : null;
                // const colors    = attrs.COLOR_0 ? this.readAccessor(attrs.COLOR_0, gltf, bin ) : null;

                // 蒙皮数据（VRM 一定有）
                // const joints  = attrs.JOINTS_0  ? this.readAccessor(attrs.JOINTS_0, gltf, bin )  : null; // 每顶点 4 个关节索引
                // const weights = attrs.WEIGHTS_0 ? this.readAccessor(attrs.WEIGHTS_0, gltf, bin ) : null; // 对应的权重

                const indices = primitive.indices !== undefined
                    ? this.readAccessor(primitive.indices, gltf, bin )
                : null; // 没有 indices 时按顺序绘制

                const vertexCount = gltf.accessors[attrs.POSITION].count;
            }
        }

        const images = await this.parseImages( gltf, bin );
        const textures = this.parseTextures( gltf );
        // console.log(images)
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

    async parseImages( gltf, bin ) {
        const images = [];

        for (const img of gltf.images ?? []) {
            let blob;

            if (img.bufferView !== undefined) {
                const bv = gltf.bufferViews[img.bufferView];
                const bytes = new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength);
                blob = new Blob([bytes], { type: img.mimeType });
            } else if (img.uri) {
                if (img.uri.startsWith('data:')) {
                    blob = await (await fetch(img.uri)).blob();
                } else {
                    blob = await (await fetch(this.resolveUri(img.uri))).blob();
                }
            }

            const bitmap = await createImageBitmap(blob);
            images.push(bitmap);
        }
        return images;
    }

    parseTextures( gltf ) {
        return (gltf.textures ?? []).map(tex => ({
            imageIndex: tex.source,
            sampler: tex.sampler !== undefined ? {
                wrapS:    gltf.samplers[tex.sampler].wrapS ?? 10497, // REPEAT
                wrapT:    gltf.samplers[tex.sampler].wrapT ?? 10497,
                magFilter: gltf.samplers[tex.sampler].magFilter ?? 9729, // LINEAR
                minFilter: gltf.samplers[tex.sampler].minFilter ?? 9987,
            } : null,
        }));
    }

    // 从材质拿基色贴图索引
    parseMaterial( gltf, materialIndex = 0 ) {
        const mat = gltf.materials[materialIndex];
        const pbr = mat.pbrMetallicRoughness ?? {};
        return {
            baseColorTexIndex: pbr.baseColorTexture?.index ?? null,
            baseColorFactor: pbr.baseColorFactor ?? [1, 1, 1, 1],
            metallicFactor:  pbr.metallicFactor ?? 1,
            roughnessFactor: pbr.roughnessFactor ?? 1,
            // 法线贴图、自发光等同理：
            normalTexIndex: mat.normalTexture?.index ?? null,
            emissiveTexIndex: mat.emissiveTexture?.index ?? null,
            alphaMode: mat.alphaMode ?? 'OPAQUE',   // MASK / BLEND 决定要不要透明渲染
            doubleSided: mat.doubleSided ?? false,
        };
    }
}

export { GLTFLoader }


/*
1. 读取glb二进制arrayBuffer
    ├─ 解析glb文件头，拆分出 JSON chunk（gltf描述对象） + BIN chunk（二进制数据bin）
2. 遍历 meshes[i] 网格
    └─ 遍历 mesh.primitives[j] 【子网格/primitive】
        ├─ 遍历 primitive.attributes 的每一项（POSITION、NORMAL、TEXCOORD_0、JOINTS_0、WEIGHTS_0）
        │    └─ attribute的值 = accessor索引 → 拿到 gltf.accessors[accessorIdx]
        │         └─ accessor.bufferView 拿到 bufferView索引 → gltf.bufferViews[bufferViewIdx]
        │              └─ bufferView.buffer 拿到buffer索引（glb一般只有buffer=0，就是BIN块）
        │              └─ bufferView.byteOffset / byteLength / byteStride → 在BIN arrayBuffer里面切片读取
        │              └─ accessor.componentType / count / type / byteOffset（accessor内偏移！！容易漏）→ 类型转换（Float32Array/Uint16/Uint8等）
        └─ primitive.indices 是可选的索引accessor，很多模型有索引绘制

*/