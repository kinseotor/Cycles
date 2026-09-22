class Matrix4x4 {
    constructor() {
        this._type = 'Matrix4x4';

        this.status = {
            needUpdate: true,
        }

        this.init();
    }
    
    get type() {
        return this._type;
    }

    static init() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    
    init() {
        this.element = Matrix4x4.init();
        this.status.needUpdate = true;
        return this
    }

    setPosition( x = 0, y = 0, z = 0 ) {
        this.element = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
        this.status.needUpdate = true;
        return this;
    }

    setScale( x = 1, y = 1, z = 1 ) {
        this.element = [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
        this.status.needUpdate = true;
        return this;
    }

    setEulerX ( x = 0 ) {
        let radX = (x * Math.PI) / 180;
        let cx = Math.cos(radX);
        let sx = Math.sin(radX);
        this.element = [
            1,  0,  0,  0,
            0, cx, sx, 0,
            0, -sx,  cx, 0,
            0,  0,  0,  1
        ];
        this.status.needUpdate = true;
        return this
    }
    setEulerY ( y = 0 ) {
        let radY = ( y * Math.PI ) / 180;
        let cy = Math.cos( radY );
        let sy = Math.sin( radY );
        this.element = [
            cy,  0, -sy, 0,
            0,  1,  0,  0,
            sy, 0, cy, 0,
            0,  0,  0,  1
        ];
        this.status.needUpdate = true;
        return this
    }
    setEulerZ ( z = 0 ) {                                             
        let radZ = ( z * Math.PI ) / 180;
        let cz = Math.cos( radZ );
        let sz = Math.sin( radZ );
        this.element = [
            cz, sz, 0, 0,
            -sz, cz, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ];
        this.status.needUpdate = true;
        return this
    }

    setEuler( x = 0, y = 0, z = 0 ) {

        x = ( x * Math.PI ) / 180;
        y = ( y * Math.PI ) / 180;
        z = ( z * Math.PI ) / 180;

        const sinX = Math.sin(x), cosX = Math.cos(x);
        const sinY = Math.sin(y), cosY = Math.cos(y);
        const sinZ = Math.sin(z), cosZ = Math.cos(z);
        
        const sinX_sinY = sinX * sinY;
        const sinX_cosY = sinX * cosY;
        const cosX_sinY = cosX * sinY;
        const cosX_cosY = cosX * cosY;
        
        // 左手坐标系 Z->Y->X 旋转顺序
        this.element = [
            cosY * cosZ,
            cosY * sinZ,
            -sinY,
            0,
            
            cosZ * sinX_sinY - cosX * sinZ,
            cosX * cosZ + sinZ * sinX_sinY,
            cosY * sinX,
            0,
            
            cosZ * cosX_sinY + sinX * sinZ,
            sinZ * cosX_sinY - sinX * cosZ,
            cosX_cosY,
            0,
            
            0, 0, 0, 1
        ]
        this.status.needUpdate = true;
        return this;
    }

    setEuler(degX, degY, degZ) {
        // 分别计算三轴半角
        const halfX = degX * Math.PI / 360;
        const halfY = degY * Math.PI / 360;
        const halfZ = degZ * Math.PI / 360;

        const cx = Math.cos(halfX), sx = Math.sin(halfX);
        const cy = Math.cos(halfY), sy = Math.sin(halfY);
        const cz = Math.cos(halfZ), sz = Math.sin(halfZ);

        // Z-Y-X 顺序欧拉转四元数（可按需调换轴顺序）
        const w = cx*cy*cz + sx*sy*sz;
        const x = sx*cy*cz - cx*sy*sz;
        const y = cx*sy*cz + sx*cy*sz;
        const z = cx*cy*sz - sx*sy*cz;

        return this.setQuaternion(x, y, z, w);
    }

    setQuaternion( x = 0, y = 0, z = 0, w = 1 ) {
        if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(w)) return this;
        x = x ?? 0;
        y = y ?? 0;
        z = z ?? 0;
        w = w ?? 1;

        const lenSq = x * x + y * y + z * z + w * w;
        if (lenSq > 0) {
            const invLen = 1 / Math.sqrt(lenSq);
            x *= invLen;
            y *= invLen;
            z *= invLen;
            w *= invLen;
        }

        const xx = x * x, yy = y * y, zz = z * z;
        const xy = x * y, xz = x * z, xw = x * w;
        const yz = y * z, yw = y * w;
        const zw = z * w;

        // 列优先存储的 4×4 矩阵（右手系）
        this.element = [
            1 - 2 * (yy + zz),
            2 * (xy + zw),
            2 * (xz - yw),
            0,

            2 * (xy - zw),
            1 - 2 * (xx + zz),
            2 * (yz + xw), 
            0,

            2 * (xz + yw),
            2 * (yz - xw),
            1 - 2 * (xx + yy),
            0,

            0, 0, 0, 1
        ];
        this.status.needUpdate = true;
        return this
    }

    static isIdentity( array ) { // Array<number>
        let result = true;
        for (let i = 0; i < 16; i++) {
            if (i % 5 === 0) {
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

    static multiply (a, b) {  // Array<number>, Array<number>
        let isAIdentity = Matrix4x4.isIdentity( a );
        if (isAIdentity) return b.slice();
    
        let isBIdentity = Matrix4x4.isIdentity( b );
        if (isBIdentity) return a.slice();
    
        let result = new Array(16).fill(0);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return result;
    }

    static inverse( array ) {
        const out = new Array(16);
        
        const m00 = array[0], m01 = array[1], m02 = array[2], m03 = array[3];
        const m10 = array[4], m11 = array[5], m12 = array[6], m13 = array[7];
        const m20 = array[8], m21 = array[9], m22 = array[10], m23 = array[11];
        const m30 = array[12], m31 = array[13], m32 = array[14], m33 = array[15];

        // 计算 2x2 子式
        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0) return null;
        det = 1.0 / det;

        out[0]  = (m11 * b11 - m12 * b10 + m13 * b09) * det;
        out[1]  = (m02 * b10 - m01 * b11 - m03 * b09) * det;
        out[2]  = (m31 * b05 - m32 * b04 + m33 * b03) * det;
        out[3]  = (m22 * b04 - m21 * b05 - m23 * b03) * det;
        out[4]  = (m12 * b08 - m10 * b11 - m13 * b07) * det;
        out[5]  = (m00 * b11 - m02 * b08 + m03 * b07) * det;
        out[6]  = (m32 * b02 - m30 * b05 - m33 * b01) * det;
        out[7]  = (m20 * b05 - m22 * b02 + m23 * b01) * det;
        out[8]  = (m10 * b10 - m11 * b08 + m13 * b06) * det;
        out[9]  = (m01 * b08 - m00 * b10 - m03 * b06) * det;
        out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
        out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
        out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
        out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
        out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
        out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

        return out;
    }

    static transpose( array ) { // Array<number>
        let result = [
                array[0], array[4], array[8], array[12],
                array[1], array[5], array[9], array[13],
                array[2], array[6], array[10], array[14],
                array[3], array[7], array[11], array[15],
            ]
        return result;
    }

    static toMatrix3X3( array ) { // Array<number>
        return [
            array[0],
            array[1],
            array[2],
            array[4],
            array[5],
            array[6],
            array[8],
            array[9],
            array[10]
        ]
    }
}
export { Matrix4x4 }