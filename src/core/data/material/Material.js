import { DataBase, Vector4, Vector3, Vector2, Vector1, WebGPURenderer } from "../../../Module.js"

class Material {
    DATA_TYPE = 'Material';

    constructor( config = {} ) {
        
        // ========= glTF PBR 材质 =========
        this.pbr_baseColorFactor = new Vector4(1, 1, 1, 1);
        this.pbr_emissiveFactor = new Vector4(0, 0, 0, 1);
        this.pbr_metallicFactor = new Vector1(0);
        this.pbr_roughnessFactor = new Vector1(1);
        this.pbr_alphaMode = new Vector1(0);    // 0:OPAQUE,1:MASK,2:BLEND
        this.pbr_alphaCutoff = new Vector1(0.5);
        this.pbr_doubleSided = new Vector1(0);  // 0 false, 1 true

        this.pbr_baseColorTexture = new Vector1(-1);
        this.pbr_emissiveTexture = new Vector1(-1);
        this.pbr_normalTexture = new Vector1(-1);
        this.pbr_metallicRoughnessTexture = new Vector1(-1);
        this.pbr_occlusionTexture = new Vector1(-1);

        // ========= VRM MToon 卡通材质 =========
        this.mtoon_shadeColorFactor = new Vector4(0.8, 0.8, 0.8, 1);
        this.mtoon_shadeColorTexture = new Vector1(-1);
        this.mtoon_toony = new Vector1(0.6);
        this.mtoon_shadingShift = new Vector1(0);
        this.mtoon_rimColorFactor = new Vector4(0, 0, 0, 1);
        this.mtoon_rimTexture = new Vector1(-1);
        this.mtoon_edgeColor = new Vector4(0,0,0,1);
        this.mtoon_edgeSize = new Vector1(0);       // 0关闭描边
        this.mtoon_outlineMode = new Vector1(0);    // 0屏幕空间 1世界空间

        // ========= Blinn-Phong 兼容材质 =========
        this.phong_ambientColor = new Vector4(0.2,0.2,0.2,1);
        this.phong_diffuseColor = new Vector4(1,1,1,1);
        this.phong_specularColor = new Vector4(1,1,1,1);
        this.phong_shininess = new Vector1(16);
        this.phong_diffuseTexture = new Vector1(-1);
        this.phong_specularTexture = new Vector1(-1);
    }

    /**
     * 把整个结构平坦展开成 Float32Array，直接 writeBuffer 上传 SSBO
     * 顺序严格和WGSL结构体保持一致
     * @returns {Float32Array}
     */
    toArray() {
        const arr = [];
        // PBR
        arr.push(...this.pbr_baseColorFactor.toArray());
        arr.push(...this.pbr_emissiveFactor.toArray());
        arr.push(this.pbr_metallicFactor.x);
        arr.push(this.pbr_roughnessFactor.x);
        arr.push(this.pbr_alphaMode.x);
        arr.push(this.pbr_alphaCutoff.x);
        arr.push(this.pbr_doubleSided.x);

        arr.push(this.pbr_baseColorTexture.x);
        arr.push(this.pbr_emissiveTexture.x);
        arr.push(this.pbr_normalTexture.x);
        arr.push(this.pbr_metallicRoughnessTexture.x);
        arr.push(this.pbr_occlusionTexture.x);

        // MToon
        arr.push(...this.mtoon_shadeColorFactor.toArray());
        arr.push(this.mtoon_shadeColorTexture.x);
        arr.push(this.mtoon_toony.x);
        arr.push(this.mtoon_shadingShift.x);
        arr.push(...this.mtoon_rimColorFactor.toArray());
        arr.push(this.mtoon_rimTexture.x);
        arr.push(...this.mtoon_edgeColor.toArray());
        arr.push(this.mtoon_edgeSize.x);
        arr.push(this.mtoon_outlineMode.x);

        // Phong
        arr.push(...this.phong_ambientColor.toArray());
        arr.push(...this.phong_diffuseColor.toArray());
        arr.push(...this.phong_specularColor.toArray());
        arr.push(this.phong_shininess.x);
        arr.push(this.phong_diffuseTexture.x);
        arr.push(this.phong_specularTexture.x);

        return new Float32Array(arr);
    }

    /**
     * 从平坦Float32数组反向回写，用于缓存/调试
     * @param {Float32Array} buffer
     */
    fromArray(buffer) {
        let p = 0;
        const read4 = () => [buffer[p++], buffer[p++], buffer[p++], buffer[p++]];
        const read1 = () => buffer[p++];

        // PBR
        this.pbr_baseColorFactor.set(...read4());
        this.pbr_emissiveFactor.set(...read4());
        this.pbr_metallicFactor.set(read1());
        this.pbr_roughnessFactor.set(read1());
        this.pbr_alphaMode.set(read1());
        this.pbr_alphaCutoff.set(read1());
        this.pbr_doubleSided.set(read1());

        this.pbr_baseColorTexture.set(read1());
        this.pbr_emissiveTexture.set(read1());
        this.pbr_normalTexture.set(read1());
        this.pbr_metallicRoughnessTexture.set(read1());
        this.pbr_occlusionTexture.set(read1());

        // MToon
        this.mtoon_shadeColorFactor.set(...read4());
        this.mtoon_shadeColorTexture.set(read1());
        this.mtoon_toony.set(read1());
        this.mtoon_shadingShift.set(read1());
        this.mtoon_rimColorFactor.set(...read4());
        this.mtoon_rimTexture.set(read1());
        this.mtoon_edgeColor.set(...read4());
        this.mtoon_edgeSize.set(read1());
        this.mtoon_outlineMode.set(read1());

        // Phong
        this.phong_ambientColor.set(...read4());
        this.phong_diffuseColor.set(...read4());
        this.phong_specularColor.set(...read4());
        this.phong_shininess.set(read1());
        this.phong_diffuseTexture.set(read1());
        this.phong_specularTexture.set(read1());
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

export { Material }