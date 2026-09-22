import { Loader, Geometry } from '../Module.js'

class OBJLoader{
    // static Material = [BasicMaterial, BlinnPongMaterial, CartoonMaterial, NormalMaterial][1];
    constructor() {
        this.loader = new Loader();
    }
 
    async load( url ) {
        if ( !url ) return;
        let objText = await this.loader.readText( url );
        
        return this._obj_to_Geometry( this.parseOBJ( objText ) );
    }

    parseOBJ( objText ) {
        
        const vertices = [];
        const uvs = [];
        const normals = [];
        const faces = [];
        let mtlLib = '';
        // 按行拆分文本
        const lines = objText.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line === '' || line.startsWith('#')) {
                return; // 跳过空行和注释行
            }

            const parts = line.split(' ').filter(part => part !== '');
            const type = parts[0];
            const data = parts.slice(1);

            switch (type) {
                case 'v':
                    vertices.push(data.map(Number));
                break;
                case 'vt':
                    uvs.push(data.map(Number));
                break;
                case 'vn':
                    normals.push(data.map(Number));
                break;
                case 'mtllib':
                    mtlLib = data[0];
                break;
                case 'f':
                    const faceData = {
                        vertexIndices: [],
                        uvIndices: [],
                        normalIndices: []
                    };
                    parts.slice(1).forEach(vertexPart => {
                        const indices = vertexPart.split('/');
                        // OBJ 索引是 1 基，转成 0 基
                        const vIndex = parseInt(indices[0], 10) - 1;
                        const vtIndex = indices[1] ? parseInt(indices[1], 10) - 1 : -1;
                        const vnIndex = indices[2] ? parseInt(indices[2], 10) - 1 : -1;

                        faceData.vertexIndices.push(vIndex);
                        faceData.uvIndices.push(vtIndex);
                        faceData.normalIndices.push(vnIndex);
                    });
                    faces.push(faceData);
                break;
                    // 若有其他类型（如 o 物体名、usemtl 材质使用等），可继续扩展 case 处理
                default:
                break;
            }
        });

        // 解析完成后，这里可以使用解析好的数据
        // console.log('顶点数据：', vertices);
        // console.log('纹理坐标：', uvs);
        // console.log('顶点法线：', normals);
        // console.log('面数据：', faces);
        // console.log('材质库：', mtlLib);

        let attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
        }

        let currentIndex = 0; // 全局连续索引，这才是正确的计数器

        for (let f of faces) {
            if (f.vertexIndices.length === 3) {
                // 三角面：3个顶点
                attribute.vertices.push(
                ...vertices[f.vertexIndices[0]],
                ...vertices[f.vertexIndices[1]],
                ...vertices[f.vertexIndices[2]]
                );
                attribute.uvs.push(
                ...uvs[f.uvIndices[0]],
                ...uvs[f.uvIndices[1]],
                ...uvs[f.uvIndices[2]]
                );
                attribute.normals.push(
                ...normals[f.normalIndices[0]],
                ...normals[f.normalIndices[1]],
                ...normals[f.normalIndices[2]]
                );

                // 索引：连续增加 3
                attribute.indices.push(currentIndex + 0, currentIndex + 1, currentIndex + 2);
                currentIndex += 3;
            }

            if (f.vertexIndices.length === 4) {
                // 四边面 → 拆成 2 个三角形：012 + 023
                // 推入 6 个顶点！！！
                attribute.vertices.push(
                    ...vertices[f.vertexIndices[0]],
                    ...vertices[f.vertexIndices[1]],
                    ...vertices[f.vertexIndices[2]],

                    ...vertices[f.vertexIndices[0]],
                    ...vertices[f.vertexIndices[2]],
                    ...vertices[f.vertexIndices[3]]
                );
                attribute.uvs.push(
                    ...uvs[f.uvIndices[0]],
                    ...uvs[f.uvIndices[1]],
                    ...uvs[f.uvIndices[2]],

                    ...uvs[f.uvIndices[0]],
                    ...uvs[f.uvIndices[2]],
                    ...uvs[f.uvIndices[3]]
                );
                attribute.normals.push(
                    ...normals[f.normalIndices[0]],
                    ...normals[f.normalIndices[1]],
                    ...normals[f.normalIndices[2]],

                    ...normals[f.normalIndices[0]],
                    ...normals[f.normalIndices[2]],
                    ...normals[f.normalIndices[3]]
                );

                // 索引：6 个连续索引
                attribute.indices.push(
                    currentIndex + 0, currentIndex + 1, currentIndex + 2,
                    currentIndex + 3, currentIndex + 4, currentIndex + 5
                );

                // 四边面占 6 个索引
                currentIndex += 6;
                }
            }

        // console.log(attribute)
        return attribute;
    }
    
    _obj_to_Geometry( attribute ) {
        const g = new Geometry();
        g.attribute = attribute;
        g.Materials = [ new OBJLoader.Material() ]
        return g;
    }
}
export { OBJLoader }

