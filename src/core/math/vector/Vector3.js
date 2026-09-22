class Vector3 {
    constructor( x = 0, y = 0, z = 0 ) {
        this._type = 'Vector3';
        this._name = 'Vector3';
        this._property = {
            x, y, z
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
        return this;
    } 

    get x() {
        return this._property.x;
    }

    set y( value ) {
        if ( value === this._property.y ) return;
        this._property.y = value;
        this.status.needUpdate = true;
        return this;
    } 

    get y() {
        return this._property.y;
    }

    set z( value ) {
        if ( value === this._property.z ) return;
        this._property.z = value;
        this.status.needUpdate = true;
        return this;
    } 

    get z() {
        return this._property.z;
    }

    set( x = 0, y = 0, z = 0 ) { 
        if ( x === this._property.x && y === this._property.y && z === this._property.z ) return;
        this._property.x = x;
        this._property.y = y;
        this._property.z = z;
        this.status.needUpdate = true;
        return this;
    }

    // 与另一个Vector3实例进行比较: boolean
    contrastVector3(v) {
        if ( v.type !=='Vector3') console.warn('type error')
        if ( v.y === this._property.y && v.x === this._property.x && v.z === this._property.z ) return true;
        return false;
    }

    // 复制另一个Vector3实例的属性
    copyVector3(v) {
        if ( this.contrastVector3(v) ) return;
        this._property.x = v.x;
        this._property.y = v.y;
        this._property.z = v.z;
        this.status.needUpdate = true;
        return this;
    }

    // 返回一个数组:[x,y,x]
    toArray( length = 3 ) {
        return [ this._property.x, this._property.y, this._property.z ].slice( 0, length );
    }

    // 模长
    ModelLength() {
        return Math.sqrt( this._property.x * this._property.x + this._property.y * this._property.y + this._property.z * this._property.z );
    }

    // 归一化
	normalize() {
		return this.divideValue( this.ModelLength() );
	}

     // 除以一个值
	divideValue( value = 1 ) {
        if ( 1 === value ) return this;
	    this.multiplyValue( 1 / value );
        this.status.needUpdate = true;
        return this;
	}

     // 乘以一个值
	multiplyValue( scalar ) {
        if ( 1 === scalar ) return this;
		this._property.x *= scalar;
		this._property.y *= scalar;
		this._property.z *= scalar;
        this.status.needUpdate = true;
        return this;
	}

    // 计算与另一个Vector3实例的点积: value
	dotVector3( v ) {
		return this._property.x * v.x + this._property.y * v.y + this._property.z * v.z;
	}

    // 计算与另一个Vector3实例的cos值: value
    getCosVector3( v ) {
        this.normalize();
        var r = this.dot( v.normalize() );
        return r;
    }

    // 计算与另一个Vector3实例的叉积: vec3
    crossVector3( v ) {
		return this.cross( this, v );
	}

    cross( a, b ) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
        return {
            x: ay * bz - az * by,
            y: az * bx - ax * bz,
            z: ax * by - ay * bx
        }
        
	}
    
};

export { Vector3 }