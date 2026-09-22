const node0 = new Cycles.Node();
const node1 = new Cycles.Node();
const node2 = new Cycles.Node();
const node3 = new Cycles.Node();
const node4 = new Cycles.Node();
const node5 = new Cycles.Node(); // ui root
const node6 = new Cycles.Node();
const node7 = new Cycles.Node();
const node8 = new Cycles.Node();
const node9 = new Cycles.Node();

node0.addChild( // scene root
    node1.addChild(
        node2,
    ),
    node3,
    node4
);

node5.addChild( // ui root
    node6,
    node7.addChild(
        node8,
        node9
    ),
);

node0.position.set(0, 0, 0);
node1.position.set(0, 1.2, 0); // camera orbit node
node2.position.set(0, 0, 20); // camera
node3.position.set(0, 0, 0);
node4.rotation.set(0, 0, 0);

node6.position.set(0, 0, 1); // camera
node7.rotation.set(90, 0, 0);
// node8.position.set(-600,100,0)

const canvas = document.getElementById('canvas');
const view = new Cycles.View({ canvas: canvas, node: node2 });
const view_ui = new Cycles.View({ canvas: canvas, node: node6, camera: new Cycles.Camera({type:'Orthographic'}) });

const input = new Input({ DOMElement: canvas });
input.damper.set(0, 0)

function CameraCtrl(x, y) {
    node1.rotation.x = Math.max(-60, Math.min(60, (node1.rotation.x - y / 2)))
    node1.rotation.y -= x / 2;
}

function touchMove(x, y) {
    node8.position.x += x*2;
    node8.position.z += y*2;
}

function viewCtrl(x, y) {
    view.viewPort.x += x*2;
    view.viewPort.y += y*2;
}

const sprite = new Cycles.Plane()
sprite.setShape(100,100);
sprite.updateAttribute();

const cube = new Cycles.Cube()
cube.updateAttribute();

const xyz = new Cycles.CoordinateSystem()
xyz.updateAttribute();

const pmxpath = [
    '../assets/pmx/ly/ly.pmx',
    '../assets/pmx/zgn/zgn.pmx',
    '../assets/pmx/xd/xd.pmx',

]
const pmxloader = new Cycles.PMXLoader();
let model = await pmxloader.load(pmxpath[2]);

let frameCount = 0;
function render() {
    // node1.rotation.y = frameCount/10;
    frameCount++;
    Cycles.Node.recursionRootNode(node0, Cycles.Node.updateNodeWorldMatrix4x4);
    Cycles.Node.recursionRootNode(node5, Cycles.Node.updateNodeWorldMatrix4x4);

    Cycles.WebGPURenderer.update();
    Cycles.View.clearColor(canvas);

    view.createLoadRenderPassHasdepth();

    // 髪.png
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 256, new Uint32Array(
        [
            0, 3, 2, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 272, new Float32Array(
        [
            0.5, 0.5, 0, 0
        ]
    ));
    let mat_arr6 = [
        23889, 42183,
        516,66072
    ]
    
    for (let i = 0; i < mat_arr6.length; i += 2) {
        view.drawGeometry(
            Cycles.WebGPURenderer.Pipelinelist.BasicMaterial,
            model,
            {
                offset: 256,
            },
            {
                indexCount: mat_arr6[i],
                firstIndex: mat_arr6[i + 1],
            }
        )
    }

    // 衣.png
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 512, new Uint32Array(
        [
            0, 3, 1, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 528, new Float32Array(
        [
            1, 0.5, 0, 0
        ]
    ));
    let mat_arr4 = [
        23001,19182,
        16269,66588,
        498,82857,
        1959,83355,
        4038,87771,
        2760,91809,
        5040,94569,
        60,99609,
        60,99669,
        732,99729,
        1866,100461,
        5898,102327,
        14997,108225,
        5856,123222,
        5856,129078,
        12411,134934,
        10455,147345,
        2148,157800,
        612,159948,
        1458,161172,
        1458,162630,
        552,164088,
        552,164640,
        738,165192,
        738,165930
    ]

    for (let i = 0; i < mat_arr4.length; i += 2) {

        view.drawGeometry(
            Cycles.WebGPURenderer.Pipelinelist.BasicMaterial,
            model,
            {
                offset: 512,
            },
            {
                indexCount: mat_arr4[i],
                firstIndex: mat_arr4[i + 1],
            }
        )
    }

    // 颜.png
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 768, new Uint32Array(
        [
            0, 3, 0, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 784, new Float32Array(
        [
            0.25, 0.25, 0, 0
        ]
    ));
    let mat_arr2 = [
        6924,0,
        1188,13848,
        600,15036,
        672,15636,
        1230,16308,
        360,17538, 
        1284,17898
    ]
    
    for (let i = 0; i < mat_arr2.length; i += 2) {

        view.drawGeometry(
            Cycles.WebGPURenderer.Pipelinelist.BasicMaterial,
            model,
            {
                offset: 768,
            },
            {
                indexCount: mat_arr2[i],
                firstIndex: mat_arr2[i + 1],
            }
        )
    }
    
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 0, new Uint32Array(
        [
            0, 4, 3, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 16, new Float32Array(
        [
            1, 1, 0, 0
        ]
    ));
    view.drawGeometry(
        Cycles.WebGPURenderer.Pipelinelist.Line,
        xyz,
        {
            offset: 0,
        },
        {

        }
    );

    view.end();

    view_ui.createLoadRenderPass();

    // View2D UI
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 1024, new Uint32Array(
        [
            1, 8, 3, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 1040, new Float32Array(
        [
            200/4096, 200/4096, 1220/4096, 2/4096
        ]
    ));
    view_ui.drawGeometry(
        Cycles.WebGPURenderer.Pipelinelist.UI,
        sprite,
        {
            offset: 1024,
        },
        {

        }
    );
    
    // view_ui.drawGeometry(
    //     Cycles.WebGPURenderer.Pipelinelist.Line,
    //     xyz,
    //     {
    //         offset: 1024,
    //     },
    //     {

    //     }
    // );

    view_ui.end();

    Cycles.View.submitCommandEncoder();
}

function animation() {
    input.invoke(CameraCtrl);
    input.invoke(touchMove);
    input.clean();
    render();
    requestAnimationFrame(animation);
}
// render();
// setInterval(render,2000)
animation()

new Cycles.Texture2D().url = '/assets/pmx/xd/颜.png';
new Cycles.Texture2D().url = '/assets/pmx/xd/衣.png';
new Cycles.Texture2D().url = '/assets/pmx/xd/髪.png';
new Cycles.Texture2D().url = '/assets/binding/atlas/UI.png';
new Cycles.Texture2D().url = '/assets/pmx/zgn/衣.png';
new Cycles.Texture2D().url = '/assets/pmx/zgn/髪.png';
new Cycles.Texture2D().url = '/assets/pmx/alxyyz/衣服.png';
new Cycles.Texture2D().url = '/assets/pmx/alxyyz/头发.png';

// const atlas1 = await Cycles.Loader.readText('/assets/binding/atlas/UI.array.json')
// console.log(JSON.parse(atlas1))
// const atlas2 = await Cycles.Loader.readText('/assets/binding/atlas/UI.hash.json')
// console.log(JSON.parse(atlas2))

function autoFullScreen() {
    Cycles.View.setCanvasSize(canvas, window.innerWidth, window.innerHeight);
    view.viewPort.set(0, 0, window.innerWidth, window.innerHeight)
    view_ui.viewPort.set(0, 0, window.innerWidth, window.innerHeight)
}
autoFullScreen();
let timer;
window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        autoFullScreen();
    }, 200);
});