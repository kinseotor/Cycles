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
node1.position.set(0, 0, 0); // camera orbit node
node2.position.set(0, 0, 5); // camera
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
    node8.position.x += x;
    node8.position.z += y;
}

const sprite = new Cycles.Plane()
sprite.setShape(50,50);
sprite.updateAttribute();

const cube = new Cycles.Cube()
cube.updateAttribute();

const xyz = new Cycles.CoordinateSystem()
xyz.updateAttribute();

let frameCount = 0;
function render() {
    // node1.rotation.y = frameCount/10;
    frameCount++;
    Cycles.Node.recursionRootNode(node0, Cycles.Node.updateNodeWorldMatrix4x4);
    Cycles.Node.recursionRootNode(node5, Cycles.Node.updateNodeWorldMatrix4x4);

    Cycles.WebGPURenderer.update();

    Cycles.View.createCommandEncoder();
    Cycles.View.clearColor(canvas);
    
    

    view.createLoadRenderPass();
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 256, new Uint32Array(
        [
            0, 0, 5, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 272, new Float32Array(
        [
            1440/4096, 1440/4096, 0/4096, 0/4096
        ]
    ));
    view.drawGeometry(
        Cycles.WebGPURenderer.Pipelinelist.Line,
        xyz,
        {
            offset: 256,
        },
        {

        }
    );

    
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 512, new Uint32Array(
        [
            0, 0, 5, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 528, new Float32Array(
        [
            1440/4096, 1440/4096, 0/4096, 0/4096
        ]
    ));
    view.pass.setBindGroup( 3, Cycles.SkyBox.bindGroup);
    view.drawGeometry(
        Cycles.WebGPURenderer.Pipelinelist.SkyBox,
        Cycles.SkyBox.cube,
        {
            offset: 512,
        },
        {

        }
    );

    view.end();

// View2D UI
    view_ui.createLoadRenderPass();
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 0, new Uint32Array(
        [
            1, 8, 3, 3
        ]
    ));
    Cycles.WebGPURenderer.device.queue.writeBuffer(Cycles.WebGPURenderer.Resource.Uniform._, 16, new Float32Array(
        [
            200/4096, 200/4096, 1220/4096, 2/4096
        ]
    ));
    view_ui.drawGeometry(
        Cycles.WebGPURenderer.Pipelinelist.UI,
        sprite,
        {
            offset: 0,
        },
        {

        }
    );
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


new Cycles.Texture2D().url = '../assets/pmx/xd/颜.png';
new Cycles.Texture2D().url = '../assets/pmx/xd/衣.png';
new Cycles.Texture2D().url = '../assets/pmx/xd/髪.png';
new Cycles.Texture2D().url = '../assets/binding/atlas/UI.png';
new Cycles.Texture2D().url = '../assets/images/brny.jpg';
new Cycles.Texture2D().url = '../assets/images/file-7iowdg9qpgxs.jpg';
new Cycles.Texture2D().url = '../assets/pmx/zgn/衣.png';
new Cycles.Texture2D().url = '../assets/pmx/zgn/髪.png';
new Cycles.Texture2D().url = '../assets/pmx/alxyyz/衣服.png';
new Cycles.Texture2D().url = '../assets/pmx/alxyyz/头发.png';

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