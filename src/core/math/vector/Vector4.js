class Vector4 {
    constructor( x = 0, y = 0, z = 0, w = 0 ) {
        this._type = 'Vector4';
        this._name = 'Vector4';
        this._property = {
            x, y, z, w
        }
        this.status = {
            needUpdate: true,
        }
    }

    get type() {
        return this._type;
    }

    get property() {
        return this._property;
    }

    set x( value ) {
        if ( value === this._property.x ) return;
        this._property.x = value;
        this.status.needUpdate = true;
    } 

    get x() {
        return this._property.x;
    }

    set y( value ) {
        if ( value === this._property.y ) return;
        this._property.y = value;
        this.status.needUpdate = true;
    } 

    get y() {
        return this._property.y;
    }

    set z( value ) {
        if ( value === this._property.z ) return;
        this._property.z = value;
        this.status.needUpdate = true;
    } 

    get z() {
        return this._property.z;
    }

    set w( value ) {
        if ( value === this._property.w ) return;
        this._property.w = value;
        this.status.needUpdate = true;
    } 

    get w() {
        return this._property.w;
    }

    set( x = 0, y = 0, z = 0, w = 0 ) { 
        if (  x === this._property.x && y === this._property.y && z === this._property.z && w === this._property.w ) return;
        this._property.x = x;
        this._property.y = y;
        this._property.z = z;
        this._property.w = w;
        this.status.needUpdate = true;
        return this;
    }

    // 与另一个Vector3实例进行比较: boolean
    contrastVector4(v) {
        if ( v.type !=='Vector4') console.warn('type error')
        if ( v.x === this._property.x && v.y === this._property.y && v.z === this._property.z && v.w === this._property.w  ) return true;
        return false;
    }

    // 复制另一个Vector3实例的属性
    copyVector4(v) {
        if ( this.contrastVector4(v) ) return;
        this._property.x = v.x;
        this._property.y = v.y;
        this._property.z = v.z;
        this._property.w = v.w;
        this.status.needUpdate = true;
    }


    // 返回一个数组:[x,y,x]
    toArray( length = 4 ) {
        return [ this._property.x, this._property.y, this._property.z, this._property.w ].slice( 0, length );
    }

    // 模长
    ModelLength() {
        return Math.sqrt( this._property.x * this._property.x + this._property.y * this._property.y + this._property.z * this._property.z + this._property.w * this._property.w );
    }

    // 归一化
	normalize() {
		return this.divideValue( this.ModelLength() );
	}

     // 除以一个值
	divideValue( value = 1 ) {
        if ( 1 === value ) return this;
        this.status.needUpdate = true;
		return this.multiplyScalar( 1 / value );
	}

     // 乘以一个值
	multiplyValue( scalar ) {
        if ( 1 === scalar ) return this;
		this._property.x *= scalar;
		this._property.y *= scalar;
		this._property.z *= scalar;
		this._property.w *= scalar;
        this.status.needUpdate = true;
		return this;
	}

    // 计算与另一个Vector4实例的点积: value
	dotVector4( v ) {
		return this._property.x * v.x + this._property.y * v.y + this._property.z * v.z + this._property.w * v.w;
	}

    // 计算与另一个Vector4实例的cos值: value
    getCosVector4( v ) {
        if ( v.type !=='Vector4') console.warn('type error')
        this.normalize();
        var r = this.dot( v.normalize() );
        return r;
    }

    // 计算与另一个Vector4实例的叉积: vec4
    crossVector4( v ) {
		return this.cross( this, v );
	}

    cross( a, b ) {
		const ax = a.x, ay = a.y, az = a.z, aw = a.w;
		const bx = b.x, by = b.y, bz = b.z, bw = b.w;
        return {
            x: ay * bz - az * by,
            y: az * bx - ax * bz,
            z: aw * bz - az * by,
            w: ax * by - ay * bx
        }
        
	}
    
};

export { Vector4 }