class IniParser {
    constructor() {
        this.fileType = 'text';
    }
    async load( url = null ) {
        let m = null;
        if (!url) throw new Error('URL is required');
        let ini = await this.parseIniFile( url);
        // console.log( ini )
        m = await this.toModel( ini );
        return m;
    }
    async toModel( ini ) {
        let group = new  Group();
        let model = new Entity3D();

        let pos = await this.#toload( ini.rootPath + ini.Position.filename );
        let KelalaB_ib = await this.#toload( ini.rootPath + ini.index[1] );
        let KelalaTexcoord_buf = await this.#toload( ini.rootPath + ini.Texcoord.filename );

        model.attribute = this.#toAttribute( pos, ini.Position.stride );
        model.attribute.indices = this.#getIndicex( KelalaB_ib );
        model.attribute.uvs = this.#getTexcoord( KelalaTexcoord_buf );

        this.parseBuffer( pos )

        group.children = [ model ];
        return group;
    }
    async parseIniFile( url ) {
        let ini_file = await this.#toload( url, 'text' );
        let ini = {
            Position: {
                filename: '',
                type: '',
                stride: null,
            },
            Texcoord: {
                filename: '',
                type: '',
                stride: null,
            },
            Blend: {
                filename: '',
                type: '',
                stride: null,
            },
            DiffuseMap:[],
            LightMap:[],
            index:[
                
            ],
            name:'',
            rootPath:'',
        }
        let iu = 0;
        for ( let e of url.split('/').filter(part => part) ) {
            iu++;
            if (iu == url.split('/').filter(part => part).length ) break;
            ini.rootPath += e + '/';
        }
        let i = 0;
        let ip = false;
        let buv = false;
        let bbl = false;

        for (let line of ini_file.split('\n')) {
            line = line.trim();
            if ( i == 0 ) ini.name = line.replace(/^; /, '');

            if ( line.startsWith('[Resource')){ip = false;buv = false;bbl = false}

            if ( line == ('[Resource' + ini.name + 'Position]')) ip = true;
            if ( ip && line.startsWith('filename = ' + ini.name ) && line.endsWith('Position.buf'))  ini.Position.filename = line.replace(/^filename = /, '');
            if ( ip && line.startsWith('type = '))  ini.Position.type = line.replace(/^type = /, '');
            if ( ip && line.startsWith('stride = '))  ini.Position.stride = line.replace(/^stride = /, '');

            if ( line == ('[Resource' + ini.name + 'Blend]')) bbl = true;
            if ( bbl && line.startsWith('filename = ') && line.endsWith('Blend.buf'))  ini.Blend.filename = line.replace(/^filename = /, '');
            if ( bbl && line.startsWith('type = '))  ini.Blend.type = line.replace(/^type = /, '');
            if ( bbl && line.startsWith('stride = '))  ini.Blend.stride = line.replace(/^stride = /, '');

            if ( line == ('[Resource' + ini.name + 'Texcoord]')) buv = true;
            if ( buv && line.startsWith('filename = ') && line.endsWith('Texcoord.buf'))  ini.Texcoord.filename = line.replace(/^filename = /, '');
            if ( buv && line.startsWith('type = '))  ini.Texcoord.type = line.replace(/^type = /, '');
            if ( buv && line.startsWith('stride = '))  ini.Texcoord.stride = line.replace(/^stride = /, '');

            if ( line.startsWith('filename = ') && line.endsWith('.ib')) ini.index.push( line.replace(/^filename = /, '') )
            if ( line.startsWith('filename = ' + ini.name ) && line.endsWith('Diffuse.dds')) ini.DiffuseMap.push( line.replace(/^filename = /, '') )
            if ( line.startsWith('filename = ' + ini.name ) && line.endsWith('LightMap.dds')) ini.LightMap.push( line.replace(/^filename = /, '') )
            i++;
        }
        return ini;
    }
    
    async #toload( url = null, type = 'buffer' ) {
        let file = null;
        if (!url) throw new Error('URL is required');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            if ( type == 'buffer' ) {
                file = await response.arrayBuffer();
            } else {
                file = await response.text();
            }
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file;
    }
    parseBuffer( file, stride = 40 ) {
        const dataView = new DataView( file );
        let array = new Float32Array(dataView.buffer, 0 );
        let ar = '';
        for ( let i = 0; i < array.length; i++ ) {
            ar += array[i].toFixed(2) + ( i % (stride/4) === (stride/4-1) ? '\n' : ' | ' );
        }
        // console.log( ar );
    }
    #toAttribute( file, stride = 40 ) {
        const dataView = new DataView( file );
        let array = new Float32Array(dataView.buffer, 0 );
        let attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }
        let uv = new Array(2).fill(null)
        let n = new Array(3).fill(null)
        for ( let i = 0; i < array.length; i++ ) {
            if ( i % (stride/4) === 0 || i % (stride/4) === 1 || i % (stride/4) === 2 ) {
                attribute.vertices.push(array[i])
            }

            // if ( i % 10 === 3 ) {
            //     uv[1] = array[i];
            // }
            // if ( i % 10 === 4 ) {
            //     uv[0] = array[i];
            //     attribute.uvs.push( ...uv );
            // }

            if ( i % (stride/4) === 5 ) {
                n[2] = array[i];
            }
            if ( i % (stride/4) === 6 ) {
                n[0] = array[i];
            }
            if ( i % (stride/4) === 7 ) {
                n[1] = array[i];
                attribute.normals.push( ...n );
            }
        }
        return attribute;
    }
    #getIndicex( file  ) {
        const dataView = new DataView( file );
        let array = new Uint32Array(dataView.buffer, 0, dataView.buffer.byteLength/4 );
        return array;
    }
    #getTexcoord( file, stride = 12 ) {
        const dataView = new DataView( file );
        let array = new Float32Array(dataView.buffer, 0, dataView.buffer.byteLength/4 );
        let uvs = [];
        let uv = new Array(2).fill(null);
        for ( let i = 0; i < array.length; i++) {
            if ( i % (stride/4) == 1 ) {
                uv[0] = array[i];
            }
            if ( i % (stride/4) == 2 ) {
                uv[1] = array[i];
                uvs.push( ...uv );
            }
        }
        return uvs;
    }
    #a( file ) {
        const dataView = new DataView( file );
        let array = new Float32Array(dataView.buffer, 0, dataView.buffer.byteLength/4 );
        // console.log( array );
        return array;
    }
    arr4toatr( array, stride = 4 ) {

    }
}
export { IniParser as iniLoader }