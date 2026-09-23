import { Vector1 } from './core/math/vector/Vector1.js'
import { Vector2 } from './core/math/vector/Vector2.js'
import { Vector3 } from './core/math/vector/Vector3.js'
import { Vector4 } from './core/math/vector/Vector4.js'
import { Matrix2x2 } from './core/math/matrix/Matrix2x2.js'
import { Matrix3x3 } from './core/math/matrix/Matrix3x3.js'
import { Matrix4x4 } from './core/math/matrix/Matrix4x4.js'
import { Quaternion } from './core/math/quaternion/Quaternion.js'
import * as Utility from './core/math/Utility.js'

import { ComponentBase } from './core/component/ComponentBase.js'
import { View } from './core/component/View.js'

import { Mesh } from './core/component/mesh/Mesh.js'

import { DataBase } from './core/data/DataBase.js'
import { Camera } from './core/data/camera/Camera.js'
import { Material } from './core/data/material/Material.js'
import { Texture2D } from './core/data/Texture/Texture2D.js'
import { Cube, Plane, Sphere, CoordinateSystem, Geometry, SkinGeometry } from './core/data/geometry/Geometry.js'

import { Node } from './core/node/Node.js'
import { Scene } from './core/world/Scene.js'
import { Engine } from './core/engine/Engine.js'
import { WebGPU } from './core/engine/webgpu/WebGPU.js'
import { WebGPURenderer } from './core/engine/webgpu/renderer/WebGPURenderer.js'
import { RenderPipeline } from './core/engine/webgpu/renderer/RenderPipeline.js'

import { Prefab } from './core/prefab/Prefab.js'
import { SkyBox } from './core/prefab/SkyBox.js';

import { Loader } from './Loader/Loader.js'
import { PMXLoader } from './loader/PMXLoader.js'
import { OBJLoader } from './loader/OBJLoader.js'
import { GLTFLoader } from './loader/GLTFLoader.js'

const config = {
    defaultPropertyName: '__cycles__',
    get version() {
        return 2.0;
    }
}

export {
    // config
    config,
    // component
    ComponentBase, Mesh, View,
    // data
    DataBase,
    Camera, Material, Texture2D,
    Cube, Plane, Sphere, CoordinateSystem, Geometry, SkinGeometry,
    // math
    Utility,
    Vector1, Vector2, Vector3, Vector4,
    Matrix2x2, Matrix3x3, Matrix4x4,
    Quaternion,
    // world
    Node,Scene,
    Engine, WebGPU, WebGPURenderer, RenderPipeline,
    //
    SkyBox,
    // 
    Prefab,
    // 
    Loader, PMXLoader,OBJLoader,GLTFLoader,
}