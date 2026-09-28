import { WebGPURenderer, Cube, Sphere, Vector1, Vector3, Vector4, Prefab } from "../../Module.js";
class SkyBox{
    static typeMenu = ['programCube', 'textureCube'];
    static geometry = new Sphere();

    static init() {
        this.radius = 100;
        this.geometry.setShape( this.radius, 16, 8 );
        
        this.geometry.updateAttribute();
        this._type = SkyBox.typeMenu[0];
        this.bindGroupLayout = WebGPURenderer.device.createBindGroupLayout({
            label: "skybox",
            entries:[
                {
                    binding:0,
                    visibility:GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type:"uniform",
                    }
                },
            ]
        });
        this.buffer = WebGPURenderer.device.createBuffer({
            label: "skybox",
            size: 4*4*6,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.property = {
            elevation: new Vector1( 20 ), // 高度 [-90, 90]
            azimuth  : new Vector1( 180 ),  // 方位角 [-180, 180], -z
            turbidity: new Vector1( 2 ),  // 浑浊度 [2, 6]
            exposure : new Vector1( 1 ),  // 亮度归一化后的曝光
        };

        this.params = {
            sunDir   : new Vector3(),
            exposure : new Vector1( 1 ),
        }

        this.result = []

        SkyBox.computeParams()

        this.writeData();

        this.bindGroup = WebGPURenderer.device.createBindGroup({
                label: 'skybox',
                layout: SkyBox.bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.buffer,
                        },
                    }
                ]
        });
    }

    static DEG2RAD = Math.PI / 180;

    static smoothstep = (a, b, x) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    };

    static computeParams() {
        const e = this.property.elevation.x * Math.PI / 180;
        const a = this.property.azimuth.x   * Math.PI / 180;
        const T = Math.min(6, Math.max(2, this.property.turbidity.x));

        this.params.sunDir.set(
            Math.cos(e) * Math.sin(a),   // x：方位角 90° 时指向 +x（东方）
            Math.sin(e),                 // y：直接对应之前 smoothstep 的昼夜因子
            Math.cos(e) * Math.cos(a),   // z：方位角 0° 指向 +z（北方/前方）
        )

        const thetaS = Math.acos(Math.min(1, Math.max(-1, this.params.sunDir.y)));
        const day = this.smoothstep(-0.08, 0.15, this.params.sunDir.y);   // 昼夜过渡因子

        // 2. Perez 系数（只依赖 T）
        const cx = [-0.0193*T-0.2592, -0.0665*T+0.0008, -0.0004*T+0.2125, -0.0641*T-0.8989, -0.0033*T+0.0452];
        const cy = [-0.0167*T-0.2608, -0.0950*T+0.0092, -0.0079*T+0.2102, -0.0441*T-1.6537, -0.0109*T+0.0529];
        const cY = [ 0.1787*T-1.4630, -0.3554*T+0.4275, -0.0227*T+5.3251,  0.1206*T-2.5771, -0.0670*T+ 0.3703];

        // 3. 天顶色度（θs 三次多项式，只依赖 θs 和 T）
        const t2 = thetaS*thetaS, t3 = t2*thetaS, T2 = T*T;
        const xz = ( 0.00166*t3 - 0.00375*t2 + 0.00209*thetaS)/T2
                + (-0.02903*t3 + 0.06377*t2 - 0.03202*thetaS + 0.00394)/T
                +  0.11693*t3 - 0.21196*t2 + 0.06052*thetaS + 0.25886;
        const yz = ( 0.00275*t3 - 0.00610*t2 + 0.00317*thetaS)/T2
                + (-0.04214*t3 + 0.08970*t2 - 0.04153*thetaS + 0.00516)/T
                +  0.15346*t3 - 0.26756*t2 + 0.06670*thetaS + 0.26688;

        // 4. 分母 F0 = perez(0, θs) 也预计算掉，片元就不用除法链了

        const f0 = c => (1 + c[0]*Math.exp(c[1])) * (1 + c[2]*Math.exp(c[3]*thetaS) + c[4]*Math.cos(thetaS)**2);
        const xScale = xz / f0(cx);
        const yScale = yz / f0(cy);
        const YScale = 1  / f0(cY);      // Yz 在归一化中约掉，无需上传

        // 5. 打包（与 WGSL struct 严格对应，共 24 个 float = 96 字节）
        this.result = new Float32Array(24);
        this.result.set(this.params.sunDir.toArray(), 0);                 // 0..2   sunDir.xyz
        this.result[3] = day;                       //        day
        this.result[4] = xScale;  this.result[5] = yScale;  this.result[6] = YScale;
        this.result[8]=cx[0]; this.result[ 9]=cx[1]; this.result[10]=cx[2]; this.result[11]=cx[3];
        this.result[12]=cx[4]; this.result[13]=cy[0]; this.result[14]=cy[1]; this.result[15]=cy[2];
        this.result[16]=cy[3]; this.result[17]=cy[4]; this.result[18]=cY[0]; this.result[19]=cY[1];
        this.result[20]=cY[2]; this.result[21]=cY[3]; this.result[22]=cY[4];
        this.result[23] = this.property.exposure.x;      // exposure 顺手塞进最后一个空位
        
        return this;
    }

    static writeData() {
        WebGPURenderer.device.queue.writeBuffer( SkyBox.buffer, 0, this.result);
    }
}

export { SkyBox }