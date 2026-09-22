function isIdentityMatrix3x3( array ) { // Array<number>
    let result = true;
    for (let i = 0; i < 9; i++) {
        if (i % 4 === 0) {
            if ( array[i] !== 1 ) {
                result = false;
                break;
            }
        } else {
            if ( array[i] !== 0 ) {
                result = false;
                break;
            }
        }
    }
    return result;
}

function inverseMatrix3x3( array ) { // Array<number>
    // 计算行列式
    const det = array[0] * ( array[4] * array[8] - array[7] * array[5]) 
              - array[1] * ( array[3] * array[8] - array[6] * array[5]) 
              + array[2] * ( array[3] * array[7] - array[6] * array[4]);
    
    // 避免除以零
    if (Math.abs(det) < 1e-8) mat3.array = [1,0,0, 0,1,0, 0,0,1];

    const invDet = 1.0 / det;
    
    // 计算逆矩阵
    const inv = [
        ( array[4]*array[8] - array[5]*array[7]) * invDet,
        ( array[2]*array[7] - array[1]*array[8]) * invDet,
        ( array[1]*array[5] - array[2]*array[4]) * invDet,
        ( array[5]*array[6] - array[3]*array[8]) * invDet,
        ( array[0]*array[8] - array[2]*array[6]) * invDet,
        ( array[2]*array[3] - array[0]*array[5]) * invDet,
        ( array[3]*array[7] - array[4]*array[6]) * invDet,
        ( array[1]*array[6] - array[0]*array[7]) * invDet,
        ( array[0]*array[4] - array[1]*array[3]) * invDet
    ];
    return inv;
}

function transposeMatrix3x3( array ) { // Array<number>
    let result = [
            array[0], array[3], array[6],
            array[1], array[4], array[7],
            array[2], array[5], array[8]
        ]
    return result;
}

function hexToRGBA8Unorm(hex) {
    // 移除#号，统一处理
    hex = hex.replace(/^#/, '');
    
    // 处理3位缩写（如#RGB）和6位标准（如#RRGGBB）、8位带透明度（如#RRGGBBAA）
    let r, g, b, a = 255;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16);
    } else {
        throw new Error('Invalid hex color format');
    }

    // 返回Uint8Array，可直接用于写入rgba8unorm格式的纹理/缓冲区
    return new Uint8Array([r, g, b, a]);
}

function hexToVector(hex) {
    hex = hex.replace(/^#/, '');
    let x, y, z, w = 1;
    if (hex.length === 3) {
        x = parseInt(hex[0] + hex[0], 16)/255;
        y = parseInt(hex[1] + hex[1], 16)/255;
        z = parseInt(hex[2] + hex[2], 16)/255;
    } else if (hex.length === 6) {
        x = parseInt(hex.slice(0, 2), 16)/255;
        y = parseInt(hex.slice(2, 4), 16)/255;
        z = parseInt(hex.slice(4, 6), 16)/255;
    } else if (hex.length === 8) {
        x = parseInt(hex.slice(0, 2), 16)/255;
        y = parseInt(hex.slice(2, 4), 16)/255;
        z = parseInt(hex.slice(4, 6), 16)/255;
        w = parseInt(hex.slice(6, 8), 16)/255;
    } else {
        throw new Error('Invalid hex color format');
    }
    return {x, y, z, w};
}

function hexToArray(hex) {
    let obj = hexToVector(hex);
    return [obj.x, obj.y, obj.z, obj.w ]
}

export {
    isIdentityMatrix3x3,

    transposeMatrix3x3,

    hexToRGBA8Unorm, hexToVector, hexToArray
}