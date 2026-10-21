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

struct TextureData {
    location: f32,
    rotated: f32,
    _pad0: f32,
    _pad1: f32,
    position: vec2<f32>,
    size: vec2<f32>,
}

struct DynamicOffset_Material { // size 51 * 4
    // ========= glTF PBR 材质 =========
    pbr_baseColorFactor: vec4<f32>,
    pbr_emissiveFactor: vec4<f32>,
    pbr_metallicFactor: f32,
    pbr_roughnessFactor: f32,
    pbr_alphaMode: f32,
    pbr_alphaCutoff: f32,
    pbr_doubleSided: f32,

    pbr_baseColorTexture: f32,
    pbr_emissiveTexture: f32,
    pbr_normalTexture: f32,
    pbr_metallicRoughnessTexture: f32,
    pbr_occlusionTexture: f32,

    // ========= VRM MToon 卡通材质 =========
    mtoon_shadeColorFactor: vec4<f32>,
    mtoon_shadeColorTexture: f32,
    mtoon_toony: f32,
    mtoon_shadingShift: f32,
    mtoon_rimColorFactor: vec4<f32>,
    mtoon_rimTexture: f32,
    mtoon_edgeColor: vec4<f32>,
    mtoon_edgeSize: f32,
    mtoon_outlineMode: f32,

    // ========= Blinn-Phong 兼容材质 =========
    phong_ambientColor: vec4<f32>,
    phong_diffuseColor: vec4<f32>,
    phong_specularColor: vec4<f32>,
    phong_shininess: f32,
    phong_diffuseTexture: f32,
    phong_specularTexture: f32,
};


struct DynamicOffset {
    index_cameraViewMatrix:u32,
    index_worldMatrix:u32,
    index_useTexture:u32,
    padding1:u32
}

// ---------------------------------------------------------

// @group(0)
@group(0) @binding(0) var<uniform> dynamicOffset_vertex: DynamicOffset;
@group(0) @binding(1) var<uniform> dynamicOffset_fragment: DynamicOffset_Material;
// @group(1)
@group(1) @binding(0) var<storage, read> worldMatrix4x4Array: array<mat4x4<f32>>;
@group(1) @binding(1) var<storage, read> cameraViewMatrix4x4: array<mat4x4<f32>>;
// @group(2)
@group(2) @binding(0) var baseColorSampler: sampler;
@group(2) @binding(1) var baseColorTexture: texture_2d_array<f32>;
@group(2) @binding(2) var<storage, read> textureDataArray: array<TextureData>;

// @group(3)
// @group(3) @binding(0) var<uniform> u : Uniforms;

// pbr ---------------------------------------------------------

@vertex
fn vs_VertexUvNormal(input: Input_VertexUvNormal) -> Varying_VertexUvNormal{
    var output: Varying_VertexUvNormal;

    output.position = cameraViewMatrix4x4[dynamicOffset_vertex.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset_vertex.index_worldMatrix] * vec4<f32>( input.position, 1.0);
    output.uvs = input.uvs;
    output.normals = input.normals;
    output.fragmentPos = input.position;

    return output;
}

@fragment
fn fs_BasicMaterial(input: Varying_VertexUvNormal) -> @location(0) vec4<f32> {

    var bs:vec4<f32> = dynamicOffset_fragment.pbr_baseColorFactor;

    var i = u32(dynamicOffset_fragment.pbr_baseColorTexture);

    var tex:vec4<f32> = textureSample(
        baseColorTexture,
        baseColorSampler,
        vec2( input.uvs.x * textureDataArray[i].size.x + textureDataArray[i].position.x, input.uvs.y * textureDataArray[i].size.y + textureDataArray[i].position.y),
        i
    );

    return tex;
}

// line ---------------------------------------------------------

@vertex
fn vs_Line(input: Input_VertexUvNormal) -> Varying_VertexUvNormal{
    var output: Varying_VertexUvNormal;
    output.position = cameraViewMatrix4x4[dynamicOffset_vertex.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset_vertex.index_worldMatrix] * vec4<f32>( input.position, 1.0);
    return output;
}

@fragment
fn fs_Line(input: Varying_VertexUvNormal) -> @location(0) vec4<f32> {
    return vec4<f32>(1,1,1,0.3);
}

// ---------------------------------------------------------