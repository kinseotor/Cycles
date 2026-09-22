import { Loader, Vector2, Vector4 } from "../../../Module.js";

class SpriteAtlas {
    static defaultDepth = 32;
    static defaultWidth = 1024*4;
    static defaultHeight = 1024*4;

    static supportType = ['.png','.jpg','.jpeg','.gif','.webp','.avif','.svg'];
    static INSTANCE_INDEX = 0;
    static INSTANCE_LIST = [];
    static status = {}

    static add( instance ) {
        if ( instance.__proto__.constructor === this && this.getUniformLocation( instance ) < 0 ) {
            this.INSTANCE_LIST.push(instance);
        } else {
            console.warn('!type')
        }
    }

    constructor() {
        this.frames = {
            hash: {},
            array: []
        }
        this.meta = {}
    }

    load() {

    }
}

class Sprite {

    static defaultPosition = new Vector2();
    static defaultSize = new Vector2( 128, 128 );

    static INSTANCE_INDEX = 0;
    static INSTANCE_LIST = [];

    static add( instance ) {
        if ( instance instanceof Sprite && this.getUniformLocation( instance ) < 0 ) {
            this.INSTANCE_LIST.push(instance);
        } else {
            console.warn('!type')
        }
    }

    constructor(config = {}) {
        config.location ??= 0;
        this.location = config.location;
        config.name ??= '';
        this.name = config.name;
        this.frame = new Vector4( Sprite.defaultPosition.x, Sprite.defaultPosition.y, Sprite.defaultSize.x, Sprite.defaultSize,y);
        this.sourceSize =  new Vector2(Sprite.defaultSize.x, Sprite.defaultSize,y);
        this.spriteSourceSize =  new Vector4( 0, 0, Sprite.defaultSize.x, Sprite.defaultSize,y);
        this.rotated = false;
        this.trimmed = false;

        Sprite.add( this );
    }
}
export { SpriteAtlas, Sprite }