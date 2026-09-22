const node0 = new Cycles.Node();
const node1 = new Cycles.Node();
const node2 = new Cycles.Node();
const node3 = new Cycles.Node();
const node4 = new Cycles.Node();

const scene = new Cycles.Scene();
scene.RootNode = node0.addChild(
    node1,
    node2,
    node3.addChild(
        node4,
    )
);

node0.position.set(0,0,-2);
node1.position.set(0,0,-10); // camera
node3.rotation.set(30,0,0)
node4.rotation.set(0,-30,0)
node4.position.set(0,0,0);

// console.log( Cycles.Node.INSTANCE_LIST )

const engine = new Cycles.Engine({api:'webgpu'});
const canvas = document.getElementById('TF-Canvas');

const view = new Cycles.View({canvas});
view.setNode(node1);

const input = new Input({DOMElement:canvas});
input.damper.set(0.99,0)

function viewCtrl(x,y) {
    // node3.position.y -= y/40;
    // node3.position.x += x/40;
    // node3.rotation.x += y/1;
    node4.rotation.y += x/1;
}
const pmxpath = [
    '../assets/pmx/ly/ly.pmx',
    '../assets/pmx/zgn/zgn.pmx',
    '../assets/pmx/xd/xd.pmx',

]
const pmxloader = new Cycles.PMXLoader();
let ly = await pmxloader.load(pmxpath[0]);

const geometry = new Cycles.Cube();
geometry.updateAttribute();

engine.initGraphicsApiAsync().then(() => {
    engine.Backend.createPipeline().then(() => {
    
        engine.setScene( scene );

        let frameCount = 0;
        let speed = 20/20;

        function fn(){
            input.update(viewCtrl)

            frameCount ++;

            scene.update();
            engine.update();

            engine.Backend.drawGeometry( [geometry,ly][0] );

            requestAnimationFrame(fn);
        }
        fn();
    })

})


let Texs = ['衣.png', '31.bmp', 'toon4.png', '颜.png', 'toon3.png', '颜赤.tga', '髪.png', '2.bmp', '衣2.png', 'mc1.png', 'SP0d_20190820_005614.bmp', 'bq.png', '黑.jpg']
let root = '/assets/pmx/ly/'
let u = [];
for (let url of Texs) {
    u.push(root + url);
    Cycles.Texture2D.createTexture(root + url)
}
// console.log(u)

// const img = await tex.load('../assets/skybox/2.21/nx.jpg');
// console.log( Cycles.Texture2D.INSTANCE_LIST );
