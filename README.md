这个世界会见识到我的倔强和厉害的

Cycles世界坐标系采用的是笛卡尔右手坐标系，默认 x 向右，y 向上，z 向外，同时使用 -z 轴为正前方朝向
https://www.w3.org/TR/webgpu/
https://webgpufundamentals.org/webgpu/lessons/zh_cn/

WebGPU 属于低级访问权限 API，为了防止中间人攻击，大部分浏览器限制仅能在 Secure contexts 中访问使用。当发布基于 WebGPU 构建的 Web 应用时，需要用户自行部署基于 https 的安全域名，或基于 localhost 的域名进行访问，包括 http://127.0.0.1，http://localhost 或 http://*.localhost 等自定义域名。

Entity = 唯一 ID（uint64/UUID），一切绑定的主键

着色器就是在 GPU 上运行的函数
最流行的下一代 GPU API 是 Khronos Group 的 Vulkan、Apple 的 Metal 和 Microsoft 的 DirectX 12。
SPIR-V：SPIR-V 很有趣，因为它是一种开放的二进制中间格式，由 Khronos Group 标准化。
您可以将 SPIR-V 视为并行编程语言编译器的 LLVM，它支持将多种语言编译为 SPIR-V 
以及将 SPIR-V 编译为多种其他语言。

engine/
├── vulkan/        # Vulkan封装层
│   ├── vk_instance.cpp
│   ├── vk_device.cpp
│   ├── vk_swapchain.cpp
│   ├── vk_buffer.cpp    # UBO/SSBO/顶点缓冲封装
│   ├── vk_texture.cpp
│   ├── vk_descriptor.cpp
│   ├── vma_allocator.cpp
├── renderer/      # 上层渲染器
├── asset/
│   ├── gltf_loader.cpp  # tinygltf封装
├── shaders/       # glsl源码，CMake自动编译spirv
├── platform/      # GLFW/SDL窗口、输入

实现了基于 PBR (Physically-based rendering) 的材质渲染

你这段是 WebGPU 渲染管线深度模板配置，depthCompare 一共 8 种标准比较模式，WGSL / JS API 通用：
完整列表
never 永远不通过深度测试，像素直接被丢弃，不会写入深度缓冲。
less（你当前在用，最常用默认）片段深度值 ＜ 深度缓冲已有值 → 通过测试  近处覆盖远处，正常 3D 渲染标准模式。
equal 片段深度 等于 缓冲深度才通过 多用于贴花、重合面片重合绘制。
less-equal 片段深度 ≤ 缓冲深度 通过 常见：透明物体、天空盒、UI 叠加场景。
greater 片段深度 ＞ 缓冲深度 通过 远处像素覆盖近处，反向绘制，极少常规场景使用。
not-equal 深度不一致就通过。
greater-equal 片段深度 ≥ 缓冲深度 通过。
always 永远通过深度测试，无视深度缓冲； 会强制覆盖画面，常用于：UI、光标、2D 界面、全屏后处理贴图。

alphaMode: 'opaque' : 画布整体视为完全不透明，画布 Alpha 通道直接被丢弃、不生效。
浏览器合成页面时，不会读取画布透明通道，画布下方的网页内容永远不会透出来。
alphaMode: 'premultiplied' : 浏览器会按照预乘透明规则，把画布和下层网页背景做正确透明混合。预乘后：R*A , G*A , B*A , A

kinseo



@group(0) @binding(0) var texArr: texture_array<f32>;
@group(0) @binding(1) var samp: sampler;

let color = textureSampleArray(texArr, samp, in.uv, in.texLayer);

Sky Lighting: #5D90E7
Ground Lighting: #74665E

device.queue.writeTexture(
  { texture: tex, origin: [x, y, z] },   // ✅ z = array layer 索引
  data,
  dataLayout,
  [width, height, depthOrArrayLayers]   // ← 第三个参数不是layer索引！
);


- `origin: [x,y,z]` 里的 **z**：指定你要写到**哪一个数组层**。`z = 0` = 第 0 层，`z=1` = 第 1 层。
- `size: [w, h, N]` 的第三个值：代表**连续写多少个数组层**。
- `"store"`：渲染完成后，把深度结果写回深度纹理（后续 pass 还要用深度就选这个）
- `"discard"`：渲染结束丢弃深度结果，不写回纹理，性能略好，后续不再读取深度时使用

MikuMikuDance
https://madebyevan.com/webgl-water/