import { DataBase, Vector4, Vector3, Vector2, Vector1, WebGPURenderer } from "../../../Module.js"

class Material extends DataBase{
    DATA_TYPE = 'Material';

    constructor() {
        super();
        this._type = 'BasicMaterial';
        this.arrayBuffer = new ArrayBuffer(256);
        this.f32 = new Float32Array( this.arrayBuffer );
        this.u32 = new Uint32Array( this.arrayBuffer );
        this.i32 = new Int32Array( this.arrayBuffer );

        this.Property = {
            // ========= glTF PBR 标准【通用段】=========
            baseColorFactor: new Vector4(1, 1, 1, 1),        // 基础颜色 RGBA
            emissiveFactor: new Vector4(0, 0, 0, 1),         // 自发光 RGB,A占位

            metallicFactor: new Vector1(0),
            roughnessFactor: new Vector1(1),
            alphaMode: new Vector1(0),                       // 0:OPAQUE,1:MASK,2:BLEND
            alphaCutoff: new Vector1(0.5),
            doubleSided: new Vector1(0),                     // 0=false,1=true

            // 纹理索引，-1代表无贴图
            baseColorTexture: new Vector1(-1),
            emissiveTexture: new Vector1(-1),
            normalTexture: new Vector1(-1),
            metallicRoughnessTexture: new Vector1(-1),
            occlusionTexture: new Vector1(-1),

            // ========= VRM MToon 扩展段【卡通专用】=========
            shadeColorFactor: new Vector4(0.5, 0.5, 0.5, 1), // 阴影色
            shadeColorTexture: new Vector1(-1),
            toony: new Vector1(0.9),                         // 卡通硬边强度 0~1
            shadingShift: new Vector1(0),                    // 阴影偏移

            rimColorFactor: new Vector4(0, 0, 0, 1),         // 轮廓光颜色
            rimTexture: new Vector1(-1),

            edgeColor: new Vector4(0, 0, 0, 1),              // 描边颜色
            edgeSize: new Vector1(0),                        // 描边宽度，0=关闭描边
            outlineMode: new Vector1(0),                     // 0:屏幕空间,1:世界空间

            // ========= Blinn-Phong / 冯氏光照扩展【老模型兼容】=========
            phongAmbientColor: new Vector4(0.2, 0.2, 0.2, 1),   // 材质环境色
            phongDiffuseColor: new Vector4(1, 1, 1, 1),         // 漫反射颜色
            phongSpecularColor: new Vector4(1, 1, 1, 1),        // 镜面高光颜色
            phongShininess: new Vector1(32),                    // 高光幂
            phongDiffuseTexture: new Vector1(-1),               // 漫反射贴图索引
            phongSpecularTexture: new Vector1(-1),              // 高光贴图索引
        }

        
    }

    getBaseData() {
        return [
            ...this.BaseProperty.baseColor.toArray(),
            ...this.BaseProperty.uvOffset.toArray(),
            ...this.BaseProperty.uvSize.toArray(),
            this.BaseProperty.textureLocation,
            this.BaseProperty.alphaCutoff, 0, 0,
        ];
    }

    /**
     * 将JS材质对象编码写入buffer的指定offset
     * @param buffer 材质uniform大buffer
     * @param slotByteOffset 插槽偏移，必须256倍数
     * @param mat 材质数据
    */
}

// console.log( new Material.Basic() )
/*
const ab = new ArrayBuffer(256);
    const f32 = new Float32Array(ab);
    const u32 = new Uint32Array(ab);
    const i32 = new Int32Array(ab);

    let floatList = [];
    let intList = [];

    // =========【1. 按WGSL结构体顺序遍历，收集（分组收集，不打乱顺序）】=========
    // 通用段
    floatList.push(...mat.baseColorFactor);
    floatList.push(mat.metallicFactor, mat.roughnessFactor);
    floatList.push(...mat.emissiveFactor, 0); // vec3 uniform补齐第4个padding
    intList.push({type:'u32', value: mat.alphaMode});
    floatList.push(mat.alphaCutoff);
    intList.push({type:'u32', value: mat.doubleSided});

    intList.push({type:'i32', value: mat.baseColorTexture});
    intList.push({type:'i32', value: mat.metallicRoughnessTexture});
    intList.push({type:'i32', value: mat.normalTexture});
    intList.push({type:'i32', value: mat.occlusionTexture});
    intList.push({type:'i32', value: mat.emissiveTexture});

    // 扩展段
    floatList.push(...mat.ambient, 0); // vec3补padding
    floatList.push(...mat.specular, 0); // vec3补padding
    floatList.push(mat.specularFactor);

    floatList.push(...mat.edgeColor);
    floatList.push(mat.edgeSize);

    intList.push({type:'i32', value: mat.toonTexture});
    intList.push({type:'i32', value: mat.sphereIndex});
    intList.push({type:'u32', value: mat.sphereMode});
    intList.push({type:'u32', value: mat.drawFlag});

    floatList.push(mat.pad0, mat.pad1, mat.pad2, mat.pad3);

    // =========【2. 回放写入内存，严格顺序】=========
    let fPtr = 0;
    let iPtr = 0;
    let bytePtr = 0;
    while(fPtr < floatList.length || iPtr < intList.length){
        if(bytePtr < fPtr * 4){
            // 当前位置是浮点数
            f32[bytePtr / 4] = floatList[fPtr];
            fPtr++;
            bytePtr += 4;
        }else{
            // 当前位置是整数
            const item = intList[iPtr];
            if(item.type === 'u32'){
                u32[bytePtr /4] = item.value;
            }else{
                i32[bytePtr /4] = item.value;
            }
            iPtr++;
            bytePtr +=4;
        }
    }
*/
export { Material }