import { SkinGeometry, Node } from '../Module.js'

class PMXLoader {
    async readArrayBuffer( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const buffer = await response.arrayBuffer();
                file = new DataView(buffer);
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file
    }

    async load(url) {
        this.index = 0; // offset
        this.pmx = {
            pmx:{},
            options:{},
            model:{},
        };
        this.dataView = await this.readArrayBuffer(url)
        this.parsePMX()
        this.modelRootPath = this.getCurrentPath( url )
        this.index = 0; // offset
        return this. _pmx_to_SkinGeometry();
    }
    
    getCurrentPath( url ) {
        
        let iu = 0;
        let currentPath = '';
        for ( let e of url.split('/').filter(part => part) ) {
            iu++;
            if (iu == url.split('/').filter(part => part).length ) break;
            currentPath += e + '/';
        }
        return currentPath;
    }

    getSupportedImagePath(path) {
        // 浏览器原生支持的图片格式（主流浏览器通用）
        const supportedFormats = new Set([
            'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'svg'
        ]);

        try {
            // 处理带查询参数的路径，提取纯文件名
            const url = new URL(path, window.location.origin);
            const filename = url.pathname.split('/').pop();
            if (!filename) return null;

            // 提取扩展名并转小写
            const ext = filename.split('.').pop()?.toLowerCase();
            if (!ext) return '';

            return supportedFormats.has(ext) ? path : '';
        } catch (e) {
            // 路径格式错误时返回空
            return '';
        }
    }
    _pmx_to_SkinGeometry() {
        const skinGeometry = new SkinGeometry();
        skinGeometry.name = this.pmx.model.name;
        for (let v of this.pmx.model.vertices) {
            skinGeometry.attribute.vertices.push( v.position.x/10, v.position.y/10, v.position.z/10)
            skinGeometry.attribute.uvs.push( v.uv.u, v.uv.v)
            skinGeometry.attribute.normals.push( v.normal.x, v.normal.y, v.normal.z)

            if (typeof v.weight === "number") {
              skinGeometry.attribute.BoneIndices.push(v.weight,0,0,0)
              skinGeometry.attribute.BoneWeights.push( 1, 0, 0, 0)
            } else if (typeof v.weight === "object"&& v.weight.length == 3 ) {
              skinGeometry.attribute.BoneIndices.push(v.weight[0],v.weight[1],0,0)
              skinGeometry.attribute.BoneWeights.push( v.weight[2], 1-v.weight[2], 0, 0)
            } else if (typeof v.weight === "object"&& v.weight.length == 8 ) {
              skinGeometry.attribute.BoneIndices.push(v.weight[0],v.weight[1],v.weight[2],v.weight[3])
              skinGeometry.attribute.BoneWeights.push( v.weight[4],v.weight[5],v.weight[6],v.weight[7] )
            } else if (typeof v.weight === "object"&& v.weight.length == 10 ) console.warn('no support')
 
        }
        for (let face of this.pmx.model.faces) {
          skinGeometry.attribute.indices.push(face[2],face[1],face[0])
          // skinGeometry.attribute.indices.push(...face)
        }
        // let start = 0;
        // for (let material of this.pmx.model.materials) {
        //   let m = new PMXLoader.Material({BaseColorTexture:this.getSupportedImagePath(this.modelRootPath + this.pmx.model.textures[material.normalTexture]),indexCount: material.faceSize, firstIndex: start});
        //   m.data.color.set(1,0,1,1)
        //   start += material.faceSize;
        //   skinGeometry.Materials.push(m)
        // }

        // let NodeArray = []
        // let RootNode = null;
        // for (let i= 0; i ++; i < this.pmx.model.bones.length ) {
        //   let n = new Node();
        //   n.name = this.pmx.model.bones[i].name;
        //   NodeArray.push( n )

        //   if ( this.pmx.model.bones[i] ==-1 ) {}
        // }
        
        // function getNodeBufferArray() {
        //   let a = []
        //   for (let n of NodeArray) {
        //     n.updateModelMatrix4();
        //     a.push(...n.modelMatrix4.array)
        //   }
        //   return a;
        // }
        
        // SkinGeometry.Animation = {
        //   NodeArray,
        // }
        return skinGeometry;
    }

    parsePMX() {
        this.pmx.pmx.name = this.string(4);
        this.pmx.pmx.version = this.float();
        this.pmx.options.headerSize = this.uint8();
        this.pmx.options.useUtf8 = this.uint8();
        this.pmx.options.extraUvSize = this.uint8();
        this.pmx.options.vertexIndexSize = this.uint8();
        this.pmx.options.textureIndexSize = this.uint8();
        this.pmx.options.materialIndexSize = this.uint8();
        this.pmx.options.boneIndexSize = this.uint8();
        this.pmx.options.morphIndexSize = this.uint8();
        this.pmx.options.rigidIndexSize = this.uint8();
        this.pmx.model.name = this.text();
        this.pmx.model.nameEnglish = this.text();
        this.pmx.model.comment = this.text();
        this.pmx.model.commentEnglish = this.text();
        this.pmx.model.vertices = this.arrayOf('vertex');
        this.pmx.model.faces = this.arrayOf('face', 3);
        this.pmx.model.textures = this.arrayOf('texture');
        this.pmx.model.materials = this.arrayOf('material');
        this.pmx.model.bones = this.arrayOf('bone');
        this.pmx.model.morphs = this.arrayOf('morph');
        this.pmx.model.frames = this.arrayOf('frame'); // 帧
        this.pmx.model.rigids = this.arrayOf('rigid'); //刚体
        this.pmx.model.joints = this.arrayOf('joint'); //关节

        this.__cycles__ = {
          normalTexture: []
        }

        // let _start = 0;
        // let a = []
        // for ( let m of this.pmx.model.materials) {
        //   m._start = _start;
        //   _start += m.faceSize;
        //   m._ = [m.faceSize,m._start]
        //   if (m.normalTexture === 6) a.push(m._)
        //   if (m.normalTexture > -1 && this.__cycles__.normalTexture.indexOf(m.normalTexture) === -1) this.__cycles__.normalTexture.push( m.normalTexture )
        // }
        // console.dir(this.__cycles__.normalTexture)

        console.log(this.pmx.model.materials)
        // console.log(this.pmx.model.textures)
        // console.log(this.pmx.model.vertices)
        // console.log(this.pmx.model.bones)
    }

    // ----------
    int8 = function() {
      this.index += 1;
      return this.dataView.getInt8(this.index - 1, true);
    };

    int16 = function() {
      this.index += 2;
      return this.dataView.getInt16(this.index - 2, true);
    };

    int32 = function() {
      this.index += 4;
      return this.dataView.getInt32(this.index - 4, true);
    };

    uint8 = function() {
      this.index += 1;
      return this.dataView.getUint8(this.index - 1, true);
    };

    uint16 = function() {
      this.index += 2;
      return this.dataView.getUint16(this.index - 2, true);
    };

    float = function() {
      this.index += 4;
      return this.dataView.getFloat32(this.index - 4, true);
    };

    char = function() {
      return String.fromCharCode(this.uint8());
    };

    chars = function(size) {
      var _i, _results;
      _results = [];
      for (_i = 0; 0 <= size ? _i < size : _i > size; 0 <= size ? _i++ : _i--) {
        _results.push(this.char());
      }
      return _results;
    };

    string = function(size) {
      return this.chars(size).join('');
    };

    bytes = function() {
      var _i, _ref, _results;
      _results = [];
      for (_i = 0, _ref = this.int32(); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
        _results.push(this.uint8());
      }
      return _results;
    };

    text = function() {
      var bytes, codes, i;
      bytes = this.bytes();
      codes = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = bytes.length; i < _ref; i += 2) {
          _results.push(bytes[i] + bytes[i + 1] * 256);
        }
        return _results;
      })();
      return String.fromCharCode.apply(null, codes);
    };

    xyz = function() {
      return {
        x: this.float(),
        y: this.float(),
        z: -this.float()
      };
    };

    xyzw = function() {
      return {
        x: this.float(),
        y: this.float(),
        z: this.float(),
        w: this.float()
      };
    };

    uv = function() {
      return {
        u: this.float(),
        v: this.float()
      };
    };

    rgb = function() {
      return {
        r: this.float(),
        g: this.float(),
        b: this.float()
      };
    };

    rgba = function() {
      return {
        r: this.float(),
        g: this.float(),
        b: this.float(),
        a: this.float()
      };
    };

    vertexIndex = function() {
      switch (this.pmx.options.vertexIndexSize) {
        case 1:
          return this.uint8();
        case 2:
          return this.uint16();
        case 4:
          return this.int32();
      }
    };

    boneIndex = function() {
      switch (this.pmx.options.boneIndexSize) {
        case 1:
          return this.int8();
        case 2:
          return this.int16();
        case 4:
          return this.int32();
      }
    };

    textureIndex = function() {
      switch (this.pmx.options.textureIndexSize) {
        case 1:
          return this.int8();
        case 2:
          return this.int16();
        case 4:
          return this.int32();
      }
    };

    materialIndex = function() {
      switch (this.pmx.options.materialIndexSize) {
        case 1:
          return this.int8();
        case 2:
          return this.int16();
        case 4:
          return this.int32();
      }
    };

    morphIndex = function() {
      switch (this.pmx.options.morphIndexSize) {
        case 1:
          return this.int8();
        case 2:
          return this.int16();
        case 4:
          return this.int32();
      }
    };

    rigidIndex = function() {
      switch (this.pmx.options.rigidIndexSize) {
        case 1:
          return this.int8();
        case 2:
          return this.int16();
        case 4:
          return this.int32();
      }
    };

    arrayOf = function(dataType, interval) {
      var _i, _ref, _results;
      if (interval == null) interval = 1;
      _results = [];
      for (_i = 0, _ref = this.int32() / interval; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
        _results.push(this[dataType]());
      }
      return _results;
    };

    vertex = function() {
      return {
        position: this.xyz(),
        normal: this.xyz(),
        uv: this.uv(),
        extraUvs: this.vertexExtraUvs(),
        weight: this.vertexWeight(),
        edgeRate: this.vertexEdgeRate()
      };
    };

    vertexExtraUvs = function() {
      var _i, _ref, _results;
      _results = [];
      for (_i = 0, _ref = this.pmx.options.extraUvSize; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
        _results.push(this.vertexExtraUv());
      }
      return _results;
    };

    vertexExtraUv = function() {
      return this.xyzw();
    };

    vertexWeight = function() {
      switch (this.vertexWeightType()) {
        case 0:
          return this.vertexWeightBdef1();
        case 1:
          return this.vertexWeightBdef2();
        case 2:
          return this.vertexWeightBdef4();
        case 3:
          return this.vertexWeightSdef();
      }
    };

    vertexWeightType = function() {
      return this.uint8();
    };

    vertexWeightBdef1 = function() {
      return this.boneIndex();
    };

    vertexWeightBdef2 = function() {
      return [this.boneIndex(), this.boneIndex(), this.vertexWeightRate()];
    };

    vertexWeightBdef4 = function() {
      return [this.boneIndex(), this.boneIndex(), this.boneIndex(), this.boneIndex(), this.vertexWeightRate(), this.vertexWeightRate(), this.vertexWeightRate(), this.vertexWeightRate()];
    };

    vertexWeightSdef = function() {
      return [this.boneIndex(), this.boneIndex(), this.vertexWeightRate(), this.vertexWeightCVector(), this.vertexWeightR0Vector(), this.vertexWeightR1Vector()];
    };

    vertexWeightCVector = function() {
      return this.xyz();
    };

    vertexWeightR0Vector = function() {
      return this.xyz();
    };

    vertexWeightR1Vector = function() {
      return this.xyz();
    };

    vertexWeightRate = function() {
      return this.float();
    };

    vertexEdgeRate = function() {
      return this.float();
    };

    face = function() {
      return [this.vertexIndex(), this.vertexIndex(), this.vertexIndex()];
    };

    texture = function() {
      return this.texturePath();
    };

    texturePath = function() {
      return this.text();
    };

    material = function() {
      return {
        name: this.text(),
        nameEnglish: this.text(),
        diffusion: this.rgba(),
        specular: this.rgb(),
        specularFactor: this.float(),
        ambient: this.rgb(),
        drawFlag: this.uint8(),
        edgeColor: this.rgba(),
        edgeSize: this.float(),
        normalTexture: this.textureIndex(),
        sphereIndex: this.textureIndex(),
        sphereMode: this.uint8(),
        toonTexture: this.materialToonTexture(),
        memo: this.text(),
        faceSize: this.int32()
      };
    };

    materialToonTexture = function() {
      switch (this.uint8()) {
        case 0:
          return this.textureIndex();
        case 1:
          return this.uint8();
      }
    };

    bone = function() {
      var flags, object;
      object = {};
      object.name = this.text();
      object.nameEnglish = this.text();
      object.position = this.xyz();
      object.parentBone = this.boneIndex();
      object.transitionState = this.int32();
      object.flags = flags = this.boneFlags();
      object.destination = flags.specifiedByIndex ? this.boneIndex() : this.xyz();
      if (flags.useAddedRotation || flags.useAddedTranslation) {
        object.addedBone = this.boneIndex();
      }
      if (flags.useAddedRotation || flags.useAddedTranslation) {
        object.addedRate = this.float();
      }
      if (flags.useFixedAxis) object.fixedAxis = this.xyz();
      if (flags.useLocalAxis) object.localAxisX = this.xyz();
      if (flags.useLocalAxis) object.localAxisZ = this.xyz();
      if (flags.useParentTransform) object.key = this.int32();
      if (flags.useIk) object.ikTargetBone = this.boneIndex();
      if (flags.useIk) object.ikLoop = this.int32();
      if (flags.useIk) object.ikLimit = this.float();
      if (flags.useIk) object.ikLinks = this.boneLinks();
      return object;
    };

    boneFlags = function() {
      var bits;
      bits = this.uint16();
      return {
        specifiedByIndex: !!(bits & 0x0001),
        useRotation: !!(bits & 0x0002),
        useTranslation: !!(bits & 0x0004),
        displayed: !!(bits & 0x0008),
        useControl: !!(bits & 0x0010),
        useIk: !!(bits & 0x0020),
        useAddedRotation: !!(bits & 0x0100),
        useAddedTranslation: !!(bits & 0x0200),
        useFixedAxis: !!(bits & 0x0400),
        useLocalAxis: !!(bits & 0x0800),
        usePhysicalTransform: !!(bits & 0x1000),
        useParentTransform: !!(bits & 0x2000)
      };
    };

    boneLinks = function() {
      var _i, _ref, _results;
      _results = [];
      for (_i = 0, _ref = this.int32(); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
        _results.push(this.boneLink());
      }
      return _results;
    };

    boneLink = function() {
      var bone, limited;
      bone = this.boneIndex();
      limited = this.uint8();
      return {
        bone: bone,
        lowerLimit: limited ? this.xyz() : void 0,
        upperLimit: limited ? this.xyz() : void 0
      };
    };

    morph = function() {
      var object;
      object = {};
      object.name = this.text();
      object.nameEnglish = this.text();
      object.controlPanel = this.uint8();
      object.type = this.uint8();
      object.records = (function() {
        var _i, _ref, _results;
        _results = [];
        for (_i = 0, _ref = this.int32(); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
          _results.push(this.morphRecord(object.type));
        }
        return _results;
      }).call(this);
      return object;
    };

    morphRecord = function(type) {
      switch (type) {
        case 0:
          return this.morphRecordGroup();
        case 1:
          return this.morphRecordVertex();
        case 2:
          return this.morphRecordBone();
        case 3:
          return this.morphRecordUv();
        case 4:
          return this.morphRecordUv();
        case 5:
          return this.morphRecordUv();
        case 6:
          return this.morphRecordUv();
        case 7:
          return this.morphRecordUv();
        case 8:
          return this.morphRecordMaterial();
      }
    };

    morphRecordVertex = function() {
      return {
        index: this.vertexIndex(),
        offset: this.xyz()
      };
    };

    morphRecordUv = function() {
      return {
        index: this.vertexIndex(),
        offset: this.xyzw()
      };
    };

    morphRecordBone = function() {
      return {
        index: this.boneIndex(),
        translation: this.xyz(),
        rotation: this.xyzw()
      };
    };

    morphRecordMaterial = function() {
      return {
        index: this.materialIndex(),
        calculationType: this.uint8(),
        diffusion: this.rgba(),
        specular: this.rgb(),
        specularFactor: this.float(),
        ambient: this.rgb(),
        edgeColor: this.rgba(),
        edgeSize: this.float(),
        textureFactor: this.rgba(),
        sphereTextureFactor: this.rgba(),
        toonTextureFactor: this.rgba()
      };
    };

    morphRecordGroup = function() {
      return {
        index: this.morphIndex(),
        rate: this.float()
      };
    };

    frame = function() {
      return {
        name: this.text(),
        nameEnglish: this.text(),
        specialFrameFlag: this.uint8(),
        elements: this.frameElements()
      };
    };

    frameElements = function() {
      var _i, _ref, _results;
      _results = [];
      for (_i = 0, _ref = this.int32(); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
        _results.push(this.frameElement());
      }
      return _results;
    };

    frameElement = function() {
      if (this.uint8()) {
        return this.morphIndex();
      } else {
        return this.boneIndex();
      }
    };

    rigid = function() {
      return {
        name: this.text(),
        nameEnglish: this.text(),
        boneIndex: this.boneIndex(),
        group: this.uint8(),
        collisionGroupFlag: this.uint16(),
        shape: this.uint8(),
        size: this.xyz(),
        position: this.xyz(),
        rotation: this.xyz(),
        mass: this.float(),
        translationDecay: this.float(),
        rotationDecay: this.float(),
        bounce: this.float(),
        friction: this.float(),
        calculationType: this.uint8()
      };
    };

    joint = function() {
      return {
        name: this.text(),
        nameEnglish: this.text(),
        type: this.uint8(),
        rigidA: this.rigidIndex(),
        rigidB: this.rigidIndex(),
        position: this.xyz(),
        rotation: this.xyz(),
        lowerTranslationLimit: this.xyz(),
        upperTranslationLimit: this.xyz(),
        lowerRotationLimit: this.xyz(),
        upperRotationLimit: this.xyz(),
        translationSpringFactor: this.xyz(),
        rationSpringFactor: this.xyz()
      };
    };
    
    async loadVMD(url) {
        this.index = 0; // offset
        this.pmx = {
            pmx:{},
            options:{},
            model:{},
        };
        this.dataView = await this.readArrayBuffer(url)
        this.parsePMX()
        return this. _pmx_to_entity3d();
    }
}

export { PMXLoader }