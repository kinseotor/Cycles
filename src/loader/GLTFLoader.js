import { SkinGeometry, Node } from '../Module.js'

class GLTFLoader {
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
        this.parseGLB( arrayBuffer );
    }

    parseGLB( arrayBuffer ) {
        let model = new Object();
        const dataView = new DataView(arrayBuffer);
        let offset = 0;
  
        // 1. 读取头部 (12字节)
        model.magic = String.fromCharCode(
            dataView.getUint8(offset++),
            dataView.getUint8(offset++),
            dataView.getUint8(offset++),
            dataView.getUint8(offset++)
        );
        
        if ( model.magic !== 'glTF') {
            throw new Error('不是有效的 GLB 文件');
        }

        model.version = dataView.getUint32(offset, true); offset += 4;
        model.length = dataView.getUint32(offset, true); offset += 4;
        
        // 2. 读取 JSON 块
        model.jsonChunkLength = dataView.getUint32(offset, true); offset += 4;
        model.jsonChunkType = dataView.getUint32(offset, true); offset += 4;
        
        if (model.jsonChunkType !== 0x4E4F534A) { // "JSON" 的十六进制
            throw new Error('JSON 块类型错误');
        }
        
        model.jsonChunkData = new Uint8Array(arrayBuffer, offset, model.jsonChunkLength);
        offset += model.jsonChunkLength;
        
        let jsonStr = '';
        for (let i = 0; i < model.jsonChunkLength; i++) {
            if (model.jsonChunkData[i] === 0) break; // 遇到空字符停止
            jsonStr += String.fromCharCode(model.jsonChunkData[i]);
        }
        
        model.gltf = JSON.parse(jsonStr);
        
        if (offset < length) {
            const binChunkLength = dataView.getUint32(offset, true); offset += 4;
            const binChunkType = dataView.getUint32(offset, true); offset += 4;
            
            if (binChunkType === 0x004E4942) { // "BIN" 的十六进制
            const binChunkData = arrayBuffer.slice(offset, offset + binChunkLength);
            gltf._binaryData = binChunkData; // 存储二进制数据
            }
        }
        console.log(model)
    }
}

export { GLTFLoader }