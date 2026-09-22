import { Vector3 } from '../../../Module.js'

class Geometry {
    constructor() {
        this._type = 'Geometry'

        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            colors: [],
            indices: [],
        }
        this.indices = {
            triangle_list: [],
        }

        this.WebGLBuffer = {}
        this.WebGPUBuffer = {}

        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
        this.config =  {
            depthTest: true,
            topology: 'triangle-list',
            cullMode: 'back',
        }
        this.Materials = []

    }
    get type(){
        return this._type;
    }
    updateAttribute() {}
}
class SkinGeometry {
    constructor() {
        this._type = 'SkinGeometry'
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            BoneIndices: [],
            BoneWeights: [],
            indices: []
        }
        this.WebGLBuffer = {}
        this.WebGPUBuffer = {}

        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
        
        this.config =  {
            depthTest: true,
            topology: 'triangle-list',
            cullMode: 'back',
        }
        this.Materials = []
    }
    get type(){
        return this._type;
    }
    setEntity3D( entity ) {
        if (entity.type !=='Entity3D') console.warn('type error')
        this.entity = entity;
    }
    updateAttribute() {}
}

class Cube extends Geometry{
    constructor() {
        super();
        this.setShape()
    }
    setShape( width=1, height=1, depth=1, widthSegments = 1, heightSegments = 1, depthSegments = 1 ) {
        if ( width == this.width && height == this.height && depth == this.depth && widthSegments == this.widthSegments && heightSegments == this.heightSegments && depthSegments == this.depthSegments ) return;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
    }

    updateAttribute() {
        let ws = Math.floor( this.widthSegments );
		let hs = Math.floor( this.heightSegments );
		let ds = Math.floor( this.depthSegments );
        let sw = this.width / ws;
        let sh = this.height / hs;
        let sd = this.depth / ds;
        let w = this.width / 2;
        let h = this.height / 2;
        let d = this.depth / 2;
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }
        this.buildPlane( this.attribute, w, h, d, ws, hs, ds, sw, sh, sd , 0, 0, 1);
        this.addIndices( ws, hs );
        this.addIndices( ws, hs );
        this.addIndices( ds, hs );
        this.addIndices( ds, hs );
        this.addIndices( ws, ds );
        this.addIndices( ws, ds );
    }

    buildPlane( attribute, w, h, d, ws, hs, ds, sw, sh, sd,) {
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 前面
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sw );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( d );
                attribute.normals.push( 0, 0, 1 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 后面
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( - w + j * sw );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( -d );
                attribute.normals.push( 0, 0, -1 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 右侧
            for ( let j = 0; j < ( ds + 1 ); j++ ) {
                attribute.vertices.push( w );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( - d + j * sd );
                attribute.normals.push( 1, 0, 0 );
                attribute.uvs.push( 1 - j / ds );
                attribute.uvs.push( i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 左侧
            for ( let j = 0; j < ( ds + 1 ); j++ ) {
                attribute.vertices.push( -w );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( d - j * sd );
                attribute.normals.push( -1, 0, 0 );
                attribute.uvs.push( 1 - j / ds );
                attribute.uvs.push( i / hs );
            }
        }
        for ( let i = 0; i < ( ds + 1 ); i++ ) { // 上
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sw );
                attribute.vertices.push( h );
                attribute.vertices.push( - d + i * sd );
                attribute.normals.push( 0, 1, 0 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( i / ds );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 下
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sw );
                attribute.vertices.push( -h );
                attribute.vertices.push( d - i * sd );
                attribute.normals.push( 0, -1, 0 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( i / ds );
            }
        }
    }

    addIndices( x = 2 , y = 2 ) {
        var index = [0, 1, 2 + x, 0, 2 + x, 1 + x];
        for ( let i = 1; i < x; i++) {
            index = index.concat(index.map( item => item + 1));
        };
        for ( let j = 1; j < y; j++) {
            index = index.concat(index.map( item => item + x + 1));
        }
        this.attribute.indices = this.attribute.indices.concat(index.map( item => item + this.attribute.offset));
        this.attribute.offset += x * y + x + y + 1;
    }
}

class Plane extends Geometry{
    constructor() {
        super();
        this.setShape()
    }
    setShape( long = 10, width = 10, height = 0, longSegments = 1, widthSegments = 1 ) {
        if ( width == this.width && height == this.height && widthSegments == this.widthSegments && longSegments == this.longSegments ) return;
        this.long = long;
        this.width = width;
        this.height = height;
        this.widthSegments = widthSegments;
        this.longSegments = longSegments;
        this.updateAttribute();
        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
    }
    updateAttribute() {
        
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset: 0
        }
		let ls = Math.floor( this.longSegments );
        let ws = Math.floor( this.widthSegments );
        let sw = this.width / ws;
        let sl = this.long / ls;
        let w = this.width / 2;
        let l = this.long / 2;
        for ( let i = 0; i < ( ws + 1 ); i++ ) { // 前面
            for ( let j = 0; j < ( ls + 1 ); j++ ) {
                this.attribute.vertices.push( l - i * sl );
                this.attribute.vertices.push( this.height );
                this.attribute.vertices.push( w - j * sw );
                this.attribute.normals.push( 0, 1, 0 );
                this.attribute.uvs.push( 1 - i / ls );
                this.attribute.uvs.push( 1 - j / ws );
            }
        }
        this.addIndices( ls, ws )
    }
    addIndices( x = 2 , y = 2 ) {
        var index = [0, 1, 2 + x, 0, 2 + x, 1 + x];
        for ( let i = 1; i < x; i++) {
            index = index.concat( index.map( item => item + 1) );
        };
        for ( let j = 1; j < y; j++) {
            index = index.concat(index.map( item => item + x + 1));
        }
        this.attribute.indices = this.attribute.indices.concat(index.map( item => item + this.attribute.offset));
        this.attribute.offset += x * y + x + y + 1;
    }
}

class Sphere extends Geometry{
    constructor() {
        super();
        this.setShape()
    }
    
    setShape( radius = 1/2, widthSegments = 32, heightSegments = 16 ) {
        if ( radius == this.radius && widthSegments == this.widthSegments && heightSegments == this.heightSegments ) return;
        this.radius = radius;
        this.widthSegments = Math.max( 3, Math.floor( widthSegments ) );
        this.heightSegments = Math.max( 2, Math.floor( heightSegments ) );
        
        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
    }

    updateAttribute() {
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
        }
		const vertex = new Vector3();
		const normal = new Vector3();

        let index = 0;
		const grid = [];

        for ( let iy = 0; iy <= this.heightSegments; iy ++ ) {
			const verticesRow = [];
			const v = iy / this.heightSegments;
			let uOffset = 0;
			if ( iy === 0 ) {
				uOffset = 0.5 / this.widthSegments;
			} else if ( iy === this.heightSegments ) {
				uOffset = - 0.5 / this.widthSegments;
			}

			for ( let ix = 0; ix <= this.widthSegments; ix ++ ) {
				const u = ix / this.widthSegments;
				vertex.x = this.radius * Math.cos( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );
				vertex.y = - this.radius * Math.cos( 0 + v * Math.PI );
				vertex.z = this.radius * Math.sin( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );
				this.attribute.vertices.push( vertex.x, vertex.y, vertex.z );
				normal.copyVector3( vertex ).divideValue( this.radius );
				this.attribute.normals.push( normal.x, normal.y, normal.z );
				this.attribute.uvs.push( u + uOffset, 1 - v );
				verticesRow.push( index ++ );
			}
			grid.push( verticesRow );

		}
        // indices
        for ( let iy = 0; iy < this.heightSegments; iy ++ ) {
            for ( let ix = 0; ix < this.widthSegments; ix ++ ) {
                const a = grid[ iy ][ ix + 1 ];
                const b = grid[ iy ][ ix ];
                const c = grid[ iy + 1 ][ ix ];
                const d = grid[ iy + 1 ][ ix + 1 ];
                if ( iy !== 0 || 0 > 0 ) this.attribute.indices.push( a, b, d );
                if ( iy !== this.heightSegments - 1 ) this.attribute.indices.push( b, c, d );
            }

        }
        
    }
}
class CoordinateSystem extends Geometry{
    constructor() {
        super();
        this.config =  {
            depthTest: true,
            topology: 'line-list',
            cullMode: 'back',
        }
        this.setShape();
    }
    
    setShape( long = 20, width = 20, height = 0, longSegments = 20, widthSegments = 20 ) {
        if ( width == this.width && height == this.height && widthSegments == this.widthSegments && longSegments == this.longSegments ) return;

        this.long = long;
        this.width = width;
        this.height = height;

        this.widthSegments = widthSegments;
        this.longSegments = longSegments;
        // this.updataAttribute();
        
        this.need = {
            updateWebGPUBuffer: true,
            updateWebGLBuffer: true,
            updateAttribute: true,
            render: true,
        }
    }

    updateAttribute() {

        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }

		let ls = Math.floor( this.longSegments );
        let ws = Math.floor( this.widthSegments );

        let sw = this.width / ws;
        let sl = this.long / ls;
        let w = this.width / 2;
        let l = this.long / 2;
        for ( let i = 0; i < ( ws + 1 ); i++ ) {
            for ( let j = 0; j < ( ls + 1 ); j++ ) {
                this.attribute.vertices.push( w - i * sw );
                this.attribute.vertices.push( this.height );
                this.attribute.vertices.push( l - j * sl );
                this.attribute.normals.push( 0, 1, 0 );
                this.attribute.uvs.push( 1 - i / ls );
                this.attribute.uvs.push( 1 - j / ws );
            }
        }

        this.addIndices( ls, ws )
    }
    addIndices( x, y ) {
        let index1 = [ 0, x ];
        let index2 = [ 0, y * (x+1)];
        let index = [];
        for ( let i = 0; i < y+1; i++ ) {
            index.push(...index1.map( item => item + i*(x + 1)))
        }
        for ( let i = 0; i < x+1; i++ ) {
            index.push(...index2.map( item => item + i*(1)))
        }
        this.attribute.indices = index;
    }
}
export { 
    Cube, Plane, Sphere, CoordinateSystem,
    Geometry, SkinGeometry
}