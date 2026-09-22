struct Input_VertexUvNormal {
    @builtin(vertex_index) vertex_index : u32,
    @builtin(instance_index) instance_index : u32,
    @location(0) position: vec3<f32>,
    @location(1) uvs: vec2<f32>,
    @location(2) normals: vec3<f32>,
}

struct Varying_VertexUvNormal {
    @builtin(position) position: vec4<f32>,
    @location(0) uvs: vec2<f32>,
    @location(1) normals: vec3<f32>,
    @location(2) fragmentPos: vec3<f32>,
};

struct textureParameter {
    location: u32,
    pivot: vec2<f32>,
    rotated: f32,

    width: f32,
    height: f32,
    offsetX: f32,
    offsetY: f32,
}

struct MaterialProperty {
    // ========= glTF PBR 标准【通用段】=========
    baseColorFactor: vec4<f32>,          // 基础颜色 RGBA
    emissiveFactor: vec4<f32>,           // 自发光 RGB,A占位
    metallicFactor: f32,
    roughnessFactor: f32,
    alphaMode: f32,                      // 0:OPAQUE,1:MASK,2:BLEND
    alphaCutoff: f32,
    doubleSided: f32,                    // 0=false,1=true
    // 纹理索引，-1代表无贴图
    baseColorTexture: f32,
    emissiveTexture: f32,
    normalTexture: f32,
    metallicRoughnessTexture: f32,
    occlusionTexture: f32,

    // ========= VRM MToon 扩展段【卡通专用】=========
    shadeColorFactor: vec4<f32>,         // 阴影色
    shadeColorTexture: f32,
    toony: f32,                          // 卡通硬边强度 0~1
    shadingShift: f32,                   // 阴影偏移
    rimColorFactor: vec4<f32>,           // 轮廓光颜色
    rimTexture: f32,
    edgeColor: vec4<f32>,                // 描边颜色
    edgeSize: f32,                       // 描边宽度，0=关闭描边
    outlineMode: f32,                    // 0:屏幕空间,1:世界空间

    // ========= Blinn-Phong / 冯氏光照扩展【老模型兼容】=========
    phongAmbientColor: vec4<f32>,         // 材质环境色
    phongDiffuseColor: vec4<f32>,         // 漫反射颜色
    phongSpecularColor: vec4<f32>,        // 镜面高光颜色
    phongShininess: f32,                  // 高光幂
    phongDiffuseTexture: f32,             // 漫反射贴图索引
    phongSpecularTexture: f32,            // 高光贴图索引
};

struct DynamicOffset {
    index_cameraViewMatrix:u32,
    index_worldMatrix:u32,
    index_useTexture:u32,
    padding1:u32,
    width: f32,
    height: f32,
    offsetX: f32,
    offsetY: f32,
}
// ---------------------------------------------------------

// @group(0)
@group(0) @binding(0) var<uniform> dynamicOffset: DynamicOffset;
// @group(1)
@group(1) @binding(0) var<storage, read> worldMatrix4x4Array: array<mat4x4<f32>>;
@group(1) @binding(1) var<storage, read> cameraViewMatrix4x4: array<mat4x4<f32>>;
// @group(2)
@group(2) @binding(0) var baseColorSampler: sampler;
@group(2) @binding(1) var baseColorTexture: texture_2d_array<f32>;

// @group(3)
// @group(3) @binding(0) var<uniform> u : Uniforms;

// ---------------------------------------------------------

@vertex
fn vs_VertexUvNormal(input: Input_VertexUvNormal) -> Varying_VertexUvNormal{
    var output: Varying_VertexUvNormal;

    output.position = cameraViewMatrix4x4[dynamicOffset.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset.index_worldMatrix] * vec4<f32>( input.position, 1.0);
    output.uvs = input.uvs;
    output.normals = input.normals;
    output.fragmentPos = input.position;

    return output;
}

@fragment
fn fs_BasicMaterial(input: Varying_VertexUvNormal) -> @location(0) vec4<f32> {

    var tex:vec4<f32> = textureSample(
        baseColorTexture,
        baseColorSampler,
        vec2(input.uvs.x*dynamicOffset.width + dynamicOffset.offsetX,input.uvs.y*dynamicOffset.height + dynamicOffset.offsetY),
        u32(dynamicOffset.index_useTexture)
    );

    return tex;
}

// ---------------------------------------------------------

@vertex
fn vs_Line(input: Input_VertexUvNormal) -> Varying_VertexUvNormal{
    var output: Varying_VertexUvNormal;
    output.position = cameraViewMatrix4x4[dynamicOffset.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset.index_worldMatrix] * vec4<f32>( input.position, 1.0);
    return output;
}

@fragment
fn fs_Line(input: Varying_VertexUvNormal) -> @location(0) vec4<f32> {
    return vec4<f32>(1,1,1,0.2);
}

// ---------------------------------------------------------