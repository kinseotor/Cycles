import * as Cycles from "@cycles/core"
import { Input } from "@cycles/input"

const pmxloader = new Cycles.PMXLoader();
let ly = await pmxloader.load('../assets/pmx/ly/ly.pmx'); // kevin

const geometry = new Cycles.Cube();
geometry.updateAttribute();

const scene = new Cycles.Scene();

const node0 = new Cycles.Node();
const node1 = new Cycles.Node();
const node2 = new Cycles.Node();
const node3 = new Cycles.Node();
const node4 = new Cycles.Node();


node0.position.set(0,0,-10);
node1.position.set(0,0,-10); // camera
node3.rotation.set(0,0,0)
// node4.position.set(0,-1,0);

scene.RootNode = node0.addChild(
    node1,
    node2,
    node3.addChild(
        node4,
    )
);

const l = 10;
for (let i = 0; i < 99; i++) {
    const node = new Cycles.Node();
    node.position.set((Math.random()*2-1)*l,(Math.random()*2-1)*l,(Math.random()*2-1)*l)
    //node.rotation.set((Math.random()*2-1)*180,(Math.random()*2-1)*180,(Math.random()*2-1)*180)
    node3.addChild(node);
}

// console.log( Cycles.Node.INSTANCE_LIST )

const engine = new Cycles.Engine({api:'webgpu'});

const canvas = document.getElementById('TF-Canvas');

const camera = new Cycles.Camera().setPerspective( 100, canvas.width/canvas.height, 0.1, 1000 );
const view = new Cycles.View();


const input = new Input({DOMElement:canvas});

function viewCtrl(x,y) {
    // node3.position.y -= y/40;
    // node3.position.x += x/40;
    // node3.rotation.x += y/1;
    node3.rotation.y += x/1;
}



engine.initGraphicsApiAsync().then(() => {
    console.dir( engine.Backend );
    engine.Backend.createPipeline().then(() => {
    
        engine.setScene( scene );

        let frameCount = 0;
        let speed = 20/20;

        function fn(){
            input.update(viewCtrl)

            // node3.rotation.y = frameCount*speed;
            // for (let i = 0; i < 100; i++) {
            //     node3.children[i].rotation.x = frameCount*speed;
            //     node3.children[i].rotation.y = frameCount*speed;
            //     node3.children[i].rotation.z = frameCount*speed;
            // }
            frameCount ++;

            scene.update();
            engine.update();

            engine.Backend.drawGeometry( [geometry,ly][0] );

            requestAnimationFrame(fn);
        }
        fn();
    })

})

// const gltfloader = await new Cycles.GLTFLoader()
// const model = gltfloader.loadGLB('/assets/gltf/scene.glb');

Cycles.WebGPURenderer.init().then((r) => {
    console.log( new Cycles.WebGPURenderer() )
})

const tex = new Cycles.Texture2D();
const img = await tex.load('../assets/skybox/2.21/nx.jpg');
console.log(tex );