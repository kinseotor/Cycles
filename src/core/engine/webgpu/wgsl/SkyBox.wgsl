struct Varying_Skybox {
    @builtin(position) pos : vec4f,
    @location(0) dir : vec3f,
};

struct SkyParams {
    sunDir   : vec3f,    // 0
    day      : f32,      // 12
    xScale   : f32,      // 16
    yScale   : f32,      // 20
    YScale   : f32,      // 24
    _pad     : f32,      // 28
    cx0123   : vec4f,    // 32
    cx4cy012 : vec4f,    // 48
    cy34cY01 : vec4f,    // 64
    cY234exp : vec4f,    // 80  (.w = exposure)
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

// @group(0)
@group(0) @binding(0) var<uniform> dynamicOffset: DynamicOffset;
// @group(1)
@group(1) @binding(0) var<storage, read> worldMatrix4x4Array: array<mat4x4<f32>>;
@group(1) @binding(1) var<storage, read> cameraViewMatrix4x4: array<mat4x4<f32>>;
// @group(2)
@group(2) @binding(0) var baseColorSampler: sampler;
@group(2) @binding(1) var baseColorTexture: texture_2d_array<f32>;
// @group(3)
@group(3) @binding(0) var<uniform> p: SkyParams;

const PI : f32 = 3.141592653589793;

@vertex
fn vs(@location(0) position : vec3f) -> Varying_Skybox {
    var o : Varying_Skybox;
    o.dir = position;
    let clip = cameraViewMatrix4x4[dynamicOffset.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset.index_worldMatrix] * vec4<f32>( position, 1.0);
    o.pos = vec4f(clip.xy, clip.w, clip.w);
    return o;
}

fn skyColor(dir : vec3f) -> vec3f {
    // theta 只以 cos 形式出现，不用再 acos
    let cosTheta = clamp(dir.y, 0.01, 1.0);
    let cosGamma = clamp(dot(dir, p.sunDir), -1.0, 1.0);
    let gamma = acos(cosGamma);                 // 全 shader 唯一一次 acos

    // 解包 15 个系数
    let cx = array<f32,5>(p.cx0123.x, p.cx0123.y, p.cx0123.z, p.cx0123.w, p.cx4cy012.x);
    let cy = array<f32,5>(p.cx4cy012.y, p.cx4cy012.z, p.cx4cy012.w, p.cy34cY01.x, p.cy34cY01.y);
    let cY = array<f32,5>(p.cy34cY01.z, p.cy34cY01.w, p.cY234exp.x, p.cY234exp.y, p.cY234exp.z);

    let Fx = (1.0 + cx[0]*exp(cx[1]/cosTheta)) * (1.0 + cx[2]*exp(cx[3]*gamma) + cx[4]*cosGamma*cosGamma);
    let Fy = (1.0 + cy[0]*exp(cy[1]/cosTheta)) * (1.0 + cy[2]*exp(cy[3]*gamma) + cy[4]*cosGamma*cosGamma);
    let FY = (1.0 + cY[0]*exp(cY[1]/cosTheta)) * (1.0 + cY[2]*exp(cY[3]*gamma) + cY[4]*cosGamma*cosGamma);

    // x/y/Y 已含全部归一化
    let x = p.xScale * Fx;
    let y = p.yScale * Fy;
    let Y = p.YScale * FY;

    let X = x / max(y, 1e-4) * Y;
    let Z = (1.0 - x - y) / max(y, 1e-4) * Y;

    return max(mat3x3f(
         3.2406, -0.9689,  0.0557,
        -1.5372,  1.8758, -0.2040,
        -0.4986,  0.0415,  1.0570) * vec3f(X, Y, Z), vec3f(0.0));
}

@fragment
fn fs(v : Varying_Skybox) -> @location(0) vec4f {
    let dir = normalize(v.dir);
    var col = mix(vec3f(0.004, 0.006, 0.018), skyColor(dir), p.day);
    col = 1.0 - exp(-col * p.cY234exp.w);       // tonemap + exposure
    col = pow(col, vec3f(1.0 / 2.2));           // gamma
    return vec4f(col, 1.0);
}

// https://threejs.org/examples/webgpu_sky