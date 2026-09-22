import { DataBase, WebGPURenderer } from "../../../Module.js";

class Texture2D extends DataBase{
    static defaultDepth = 32;
    static defaultWidth = 1024*4;
    static defaultHeight = 1024*4;

    static supportType = ['.png','.jpg','.jpeg','.gif','.webp','.avif','.svg'];
    static INSTANCE_INDEX = 0;
    static INSTANCE_LIST = []
    static status = {
        needUpdate_Length: true,
    }

    static add( instance ) {
        if ( instance.__proto__.constructor === this && this.getUniformLocation( instance ) < 0 ) {
            this.INSTANCE_LIST.push(instance);
        } else {
            console.warn('!type')
        }
    }
    static getUniformLocation( instance ) {
        let result = null;
        if ( instance && instance.__proto__.constructor === this ) {
            result = this.INSTANCE_LIST.indexOf( instance );
        }
        return result;
    }

    static getLocationByUrl( url ) {
        if ( url ) return;
        let index = null;
        for (let tex of Texture2D.INSTANCE_LIST ) {
            if ( tex.type == 'Texture' && url == tex.url ) {
                break;
            }
            index ++;
        }
        return index;
    }
    static getUniformByUrl( url ) {
        if ( url ) return null;
        let tex = null;
        for ( tex of Texture2D.INSTANCE_LIST ) {
            if ( tex.type == 'Texture' && url == tex.url ) {
                break;
            }
        }
        return tex;
    }

    static async loadImageBitmap( url ) {
        if (!url) throw new Error('URL is required');
        const response = await fetch(url);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        if (imageBitmap.width === 0 || imageBitmap.height === 0) {
            throw new Error('Invalid image size');
        }
        return imageBitmap;
    }

    static isLikelyImagePath(src){
        if(!src) return false;
        const lower = src.toLowerCase();
        return this.supportType.some( ext => lower.endsWith(ext) ) 
            || src.startsWith('data:image/') 
            || src.startsWith('blob:');
    }

    static update() {
        let index = 0;
        for ( let instance of Texture2D.INSTANCE_LIST ) {
            if ( index === Texture2D.defaultDepth ) break;
            if ( instance.status.value === 1 ) {
                instance.load();
                instance.status.value = 2;
            }
            if ( instance.status.value === 3 && !instance.status.isInGPU) {
                WebGPURenderer.writeTexture( instance.res, index )
                instance.status.isInGPU = true;
            }
            index++;
        }
    }

    static createTexture( url ) {
        if ( typeof url !== 'string' ) return null;
        let result = this.getUniformByUrl(url);
        if ( !result && this.isLikelyImagePath(url)) {
            result = new this({url});
        }
        return result;
    }

    DATA_TYPE = 'Texture2D'
    _typeMeun = ['Texture','TextureAtlas'];
    _type = this._typeMeun[0];
    _url = null;
    uniforms = []

    constructor(config = {url:null}) {
        super();
        this.status = {
            _value: 0,
            get value() { return this._value },
            set value(v) { this._value = v },
            get now() {
                return ['none','needLoad','loading','success','fail'][this._value];
            },
            isInGPU: false,
        }
        this.url = config.url;

        if ( typeof this.url === 'string' ) {
            // this.load( this.url);
        } else {
            this.clear();
        }
        this.instance_index = Texture2D.INSTANCE_INDEX++;
        Texture2D.INSTANCE_LIST.push(this);
    }

    set res( res ) {
        this.property = {
            res: res,
            width: res.width,
            height: res.height,
        }
        this._type = this._typeMeun[0];
        this.status.value = 3;
        this.status.isInGPU = false;
    }

    set url( url ) {
        if ( (this._url === url && typeof url !== 'string') || !Texture2D.isLikelyImagePath(url)) return;
        this.status.value = 1;
        this._type = this._typeMeun[0];
        this._url = url; 
    }
    get type() {
        return this._type;
    }
    get width() {
        if ( !this.isLoad ) return this.property.width;
    }
    get height() {
        if ( !this.isLoad ) return this.property.height;
    }
    get res() {
        if ( !this.isLoad ) return this.property.res;
    }
    get url() {
        return this._url;
    }

    load( url = this._url , call = null ) {
        if ( !url ) return;
        this.status.value = 2;
        const promise = Texture2D.loadImageBitmap(url);
        promise.then(img => {
            this._url = url;
            this.res?.close?.();
            this.res = img;
            if( typeof call === 'function'){
                call(img);
            }
        })
        .catch(err => {
            this.status.value = 4;
            console.error("image load error", err);
        })
        return promise;
    }

    clear() {
        this.status.value = 0;
        this.status.isInGPU = false;
        this.res?.close?.();
        this.property = {
            res: null,
            width: Texture2D.defaultWidth,
            height: Texture2D.defaultHeight,
        }
        this._url = null;
    }

    onDestroy() {

    }

    exportUniform() {
        if ( this.type === 'Texture') {
            this.uniforms.length = 0;
            const location = Texture2D.getUniformLocation(this);
            const width = this.width/ Texture2D.defaultWidth;
            const height = this.height / Texture2D.defaultHeight;
            const tex = {
                location: location,
                x: 0,
                y: 0,
                width: width,
                height: height,
            }
            this.uniforms.push(tex)
        }
        return this.uniforms;
    }
}

class TextureManager {
    static load() {

    }

    static loadMulti( array ) {
        if ( Array.isArray( array ) ) {
            for (let url of array ) {
                if( typeof url === 'string' )this.load( url );
            }
        }
    }
}

export { Texture2D, TextureManager }