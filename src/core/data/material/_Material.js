import { Vector4 } from '../../Transform.module.js';

class BasicMaterial {
    constructor( config = {
        BaseColorTexture:null,
        indexCount:null,
        firstIndex: 0
    } ) {
        this.type = 'BasicMaterial';
        this._BaseColorTexture = config.BaseColorTexture;
        this.BaseColorTextureIndex = null;

        this.name = ''

        this.data = {
            color: new Vector4( 1, 1, 1, 1 ),
            materialType: 0,
            useTexture: -1, 
            EmissiveIntensity: 1.0,
            DiffuseIntensity: 0.0,
            SpecularIntensity: 1.0,      // 镜面反光强度
            Shininess: 128.0,            // 锐利度
            LightDotFragment: 0.7,
            Brightere: 1.0,
            Darker:0.5,

            indexCount: config.indexCount,
            firstIndex: config.firstIndex,
        }

    }
    static toShaderStruct() {
        let array = [
            1, 1, 1, 1,
            0, -1, 0, 0,
            1, 0.4, 1, 128,
            0.7, 0, 0, 0
        ];

        return array;
    }
    toShaderStruct() {
        let array = [
            // 4*4 bytes
            ...this.data.color.toArray(),
            // 4*4 bytes
            this.data.materialType,
            this.data.useTexture,
            0,0,
            // 4*4 bytes
            this.data.EmissiveIntensity,
            this.data.DiffuseIntensity,
            this.data.SpecularIntensity,
            this.data.Shininess,            
            // 4*4 bytes
             this.data.LightDotFragment,
             this.data.Brightere,
             this.data.Darker,
             0
        ];

        return array;
    }

    set BaseColorTexture ( url ){
        this._BaseColorTexture = url;
    }

    get BaseColorTexture (){
        return this._BaseColorTexture;
    }
}

class BlinnPongMaterial extends BasicMaterial {
    constructor( config = {
        BaseColorTexture:null,
        indexCount:null,
        firstIndex: 0
    } ) {
        super();
        this.type = 'BlinnPongMaterial';
        this._BaseColorTexture = config.BaseColorTexture;

        this.data = {
            color: new Vector4( 1, 1, 1, 1 ),
            materialType: 1,
            useTexture: -1, 
            EmissiveIntensity: 0.3,
            DiffuseIntensity: 1.5,
            SpecularIntensity: 1.0,      // 镜面反光强度
            Shininess: 128.0,            // 锐利度
            LightDotFragment: 0.7,
            Brightere: 1.0,
            Darker:0.5,

            indexCount: config.indexCount,
            firstIndex: config.firstIndex,
        }
    }
}

class CartoonMaterial extends BasicMaterial {
    constructor( config = {
        BaseColorTexture:null,
        indexCount:null,
        firstIndex: 0
    } ) {
        super();
        this.type = 'CartoonMaterial';
        this._BaseColorTexture = config.BaseColorTexture;
        this.data = {
            color: new Vector4( 1, 1, 1, 1 ),
            materialType: 2,
            useTexture: -1, 
            EmissiveIntensity: 0.65,
            DiffuseIntensity: 0.4,
            SpecularIntensity: 1.0,      // 镜面反光强度
            Shininess: 128.0,            // 锐利度
            LightDotFragment: -0.1,      // 色阶
            Brightere: 1.0,
            Darker:0.5,

            indexCount: config.indexCount,
            firstIndex: config.firstIndex,
        }
    }
}

class NormalMaterial extends BasicMaterial {
    constructor( config = {
        BaseColorTexture:null,
        indexCount:null,
        firstIndex: 0
    } ) {
        super();
        this.type = 'NormalMaterial';
        
        this._BaseColorTexture = config.BaseColorTexture;
        this.data = {
            color: new Vector4( 1, 1, 1, 1 ),
            materialType: 3,
            useTexture: -1, 
            EmissiveIntensity: 1.0,
            DiffuseIntensity: 0.0,
            SpecularIntensity: 0.0,      // 镜面反光强度
            Shininess: 0.0,            // 锐利度
            LightDotFragment: 0.7,
            Brightere: 1.0,
            Darker:0.5,

            indexCount: config.indexCount,
            firstIndex: config.firstIndex,
        }
    }
}

export { BasicMaterial, BlinnPongMaterial, CartoonMaterial, NormalMaterial }