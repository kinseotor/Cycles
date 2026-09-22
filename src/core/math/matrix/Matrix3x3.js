class Matrix3x3 {
    constructor() {
        this._type = 'Matrix3x3';

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
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    
    init() {
        this.element = Matrix3x3.init();
        this.status.needUpdate = true;
        return this
    }

    setPosition( x = 0, y = 0 ) {
        this.element = [
            1, 0, 0,
            0, 1, 0,
            x, y, 1
        ]
        this.status.needUpdate = true;
        return this;
    }

    setScale( x = 1, y = 1, z = 1  ) {
        this.element = [
            x, 0, 0,
            0, y, 0,
            0, 0, z
        ]
        this.status.needUpdate = true;
        return this;
    }

    setEulerX ( x = 0 ) {
        let radX = (x * Math.PI) / 180;
        let cx = Math.cos(radX);
        let sx = Math.sin(radX);
        this.element = [
            1,  0,  0,
            0, cx, sx,
            0, -sx,  cx
        ];
        this.status.needUpdate = true;
        return this
    }
    setEulerY ( y = 0 ) {
        let radY = ( y * Math.PI ) / 180;
        let cy = Math.cos( radY );
        let sy = Math.sin( radY );
        this.element = [
            cy,  0, -sy,
            0,  1,  0,
            sy, 0, cy,
        ];
        this.status.needUpdate = true;
        return this
    }
    setEulerZ ( z = 0 ) {                                             
        let radZ = ( z * Math.PI ) / 180;
        let cz = Math.cos( radZ );
        let sz = Math.sin( radZ );
        this.element = [
            cz, sz, 0,
            -sz, cz, 0,
            0,  0, 1
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
            
            cosZ * sinX_sinY - cosX * sinZ,
            cosX * cosZ + sinZ * sinX_sinY,
            cosY * sinX,
            
            cosZ * cosX_sinY + sinX * sinZ,
            sinZ * cosX_sinY - sinX * cosZ,
            cosX_cosY,
            
        ]
        this.status.needUpdate = true;
        return this
    }

    setQuaternion( x = 0, y = 0, z = 0, w = 1 ) {
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

            2 * (xy - zw),
            1 - 2 * (xx + zz),
            2 * (yz + xw), 

            2 * (xz + yw),
            2 * (yz - xw),
            1 - 2 * (xx + yy),

        ];
        this.status.needUpdate = true;
        return this
    }
}
export { Matrix3x3 }