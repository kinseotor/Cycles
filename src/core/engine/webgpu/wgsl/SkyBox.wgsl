struct Varying_Skybox {
    @builtin(position) pos : vec4f,
    @location(0) dir : vec3f,
};

struct SkyParams {
    sunDir   : vec3f,   // 太阳方向（单位向量）
    exposure : f32,
    zenith   : vec4f,   // 天顶色
    horizon  : vec4f,   // 地平线色
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
@group(3) @binding(0) var<uniform> sky: SkyParams;

@vertex
fn vs(@location(0) position : vec3f) -> Varying_Skybox {
    var o : Varying_Skybox;
    o.dir = position;
    let clip = cameraViewMatrix4x4[dynamicOffset.index_cameraViewMatrix] * worldMatrix4x4Array[dynamicOffset.index_worldMatrix] * vec4<f32>( position, 1.0);
    o.pos = vec4f(clip.xy, clip.w, clip.w);
    return o;
}

fn skyColor(dir : vec3f) -> vec3f {
    let y = clamp(dir.y, -1.0, 1.0);

    // 天顶 → 地平线渐变
    var col = mix(sky.zenith.xyz, sky.horizon.xyz, pow(1.0 - max(y, 0.0), 2.0));

    // 太阳：光晕 + HDR 日盘
    let sunAmt = max(dot(dir, sky.sunDir), 0.0);
    col += vec3f(1.0, 0.6, 0.3) * pow(sunAmt, 8.0) * 0.4;
    col += vec3f(1.0, 0.9, 0.7) * pow(sunAmt, 1024.0) * 20.0;

    return col;
}

@fragment
fn fs(v : Varying_Skybox) -> @location(0) vec4f {
    // 插值后的方向必须归一化：跨立方体表面插值后不再是单位向量
    let dir = normalize(v.dir);

    var col = skyColor(dir);

    // 地平线以下：地面/雾色，避免下半屏穿帮
    if (dir.y < -0.0) {
        col = mix(sky.horizon.xyz * 0.6, vec3f(0.2, 0.2, 0.2),
                  min(-dir.y * 4.0, 1.0));
    }

    // HDR tonemap，把日盘的 20+ 亮度压回显示范围
    col = 1.0 - exp(-col * sky.exposure);

    // WebGPU 画布默认不做 sRGB 转换，手动加伽马（不想要可删）
    col = pow(col, vec3f(1.0 / 2.2));

    var b = vec3<f32>(1,1,1);

    return vec4f( col, 1.0 );
}

// https://threejs.org/examples/webgpu_sky