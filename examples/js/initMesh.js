import { Node, View, Camera, Plane, Cube, CoordinateSystem, GLTFLoader, Mesh, MeshRenderer, WebGPURenderer } from "@cycles/core";
import { Input } from "@cycles/input"

class Sample {
    async run() {
        const node0 = new Node();
        const node1 = new Node();
        const node2 = new Node();
        const node3 = new Node();
        const node4 = new Node();
        const node5 = new Node(); // ui root
        const node6 = new Node();
        const node7 = new Node();
        const node8 = new Node();
        const node9 = new Node();

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
        node1.rotation.set(0, 0, 0);
        node2.position.set(0, 0, 2); // camera
        node3.position.set(0, 1, 0);
        node4.rotation.set(0, 0, 0);

        node6.position.set(0, 0, 1); // camera
        node7.rotation.set(90, 0, 0);
        // node8.position.set(-600,100,0)

        const canvas = document.getElementById('canvas');
        const view = new View({ canvas: canvas, node: node2 });
        const view_ui = new View({ canvas: canvas, node: node6, camera: new Camera({type:'Orthographic'}) });

        const input = new Input({ DOMElement: canvas });
        input.damper.set(0, 0)

        function CameraCtrl(x, y) {
            node1.rotation.x = Math.max(-90, Math.min(90, (node1.rotation.x - y / 2)))
            node1.rotation.y -= x / 2;
        }

        function touchMove(x, y) {
            node8.position.x += x;
            node8.position.z += y;
        }

        function viewCtrl(x, y) {
            view.viewPort.x += x*2;
            view.viewPort.y += y*2;
        }

        const sprite = new Plane()
        sprite.setShape(50,50);
        sprite.updateAttribute();

        const cube = new Cube()
        cube.updateAttribute();

        const xyz = new CoordinateSystem()
        xyz.setShape(20,20,0,20,20)
        xyz.updateAttribute();

        const vrms = [
            '../assets/vrm/ly.vrm',
            '../assets/vrm/alxy_yz.vrm',
            '../assets/vrm/brny.vrm'
        ]
        const gltfloader = new GLTFLoader()
        let vrm = await gltfloader.load( vrms[ 0 ],( model ) => {
            for (let i = 0; i < model.images.length; i++ ) {
                WebGPURenderer.writeTexture( model.images[i], i );
            }

            for ( let mat of model.gltf.materials ) {
                const material = new
            }
        })
        console.log(vrm)

        const renderer = new MeshRenderer();
        const mesh = new Mesh();
        mesh.geometry = cube;
        // console.log(mesh,model)
        WebGPURenderer._set();

        let frameCount = 0;
        function render() {
            // node1.rotation.y = frameCount/10;
            frameCount++;
            Node.recursionRootNode(node0, Node.updateNodeWorldMatrix4x4);
            Node.recursionRootNode(node5, Node.updateNodeWorldMatrix4x4);

            WebGPURenderer.update();

            View.createCommandEncoder();
            View.clearColor(canvas);
            view.createLoadRenderPass();
            
            var i = 5;
            WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_vertex, 256*i, new Uint32Array(
                [
                    0, 4, 3, 3
                ]
            ));
            WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_vertex, 256*i+16, new Float32Array(
                [
                    1, 1, 0, 0
                ]
            ));
            view.drawGeometry(
                WebGPURenderer.Pipelinelist.Line,
                xyz,
                {
                    offset: 256*i,
                },
                {

                }
            );

            renderer.drawMesh( mesh, view, node0 )

            view.end();

            // view_ui.createLoadRenderPass();

            // i = 6;
            // WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_vertex, 256*i, new Uint32Array(
            //     [
            //         1, 8, 3, 3
            //     ]
            // ));
            // WebGPURenderer.device.queue.writeBuffer(WebGPURenderer.Resource.Uniform.DynamicOffset_vertex, 256*i+16, new Float32Array(
            //     [
            //         200/4096, 200/4096, 1220/4096, 2/4096
            //     ]
            // ));
            // view_ui.drawGeometry(
            //     WebGPURenderer.Pipelinelist.UI,
            //     sprite,
            //     {
            //         offset: 256*i,
            //     },
            //     {

            //     }
            // );
            // view_ui.end();

            View.submitCommandEncoder();
        }

        function animation() {
            input.invoke(CameraCtrl);
            input.invoke(touchMove);
            input.clean();
            render();
            requestAnimationFrame(animation);
        }

        animation()

        function autoFullScreen() {
            View.setCanvasSize(canvas, window.innerWidth, window.innerHeight);
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
    }
}

new Sample().run()