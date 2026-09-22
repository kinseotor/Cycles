let scale = 1 / (window.devicePixelRatio || 1);
document.write(`
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGPU Renderer</title>
    <link rel="icon" href="../assets/logos/webgpu.webp">
    <meta
        name="viewport"
        content="width=device-width,
        initial-scale=${scale},
        maximum-scale=${scale},
        minimum-scale=${scale},
        user-scalable=no"
    />
    <style>
        html,body{
            margin: 0;
            overflow-x: hidden;
            overflow-y: hidden;
        }
    </style>
`);