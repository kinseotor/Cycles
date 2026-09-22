class Vector2 {
    constructor( x = 0, y = 0 ) {
        this._type = 'Vector2';
        this._name = 'Vector2';
        this._property = {
            x, y
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

    set( x = 0, y = 0 ) { 
        if ( x === this._property.x && y === this._property.y ) return;
        this._property.x = x;
        this._property.y = y;
        this.status.needUpdate = true;
    }

    // 与另一个Vector2实例进行比较: boolean
    contrastVector2(v) {
        if ( v.type !=='Vector2') console.warn('type error')
        if ( v.y === this._property.y && v.x === this._property.x ) return true;
        return false;
    }

    // 复制另一个Vector3实例的属性
    copyVector2(v) {
        if ( this.contrastVector2(v) ) return;
        this._property.x = v.x;
        this._property.y = v.y;
        this.status.needUpdate = true;
    }

    // 返回一个数组:[x,y]
    toArray( length = 2 ) {
        return [ this._property.x, this._property.y ].slice( 0, length );
    }

    // 模长
    ModelLength() {
        return Math.sqrt( this._property.x * this._property.x + this._property.y * this._property.y );
    }

    // 归一化
	normalize() {
		return this.divideValue( this.ModelLength() );
	}

     // 除以一个值
	divideValue( value = 1 ) {
        if ( 1 === value ) return this;
	    this.multiplyScalar( 1 / value );
        this.status.needUpdate = true;
	}

     // 乘以一个值
	multiplyValue( scalar ) {
        if ( 1 === scalar ) return this;
		this._property.x *= scalar;
		this._property.y *= scalar;
        this.status.needUpdate = true;
	}

    // 计算与另一个Vector2实例的点积: value
	dotVector2( v ) {
		return this._property.x * v.x + this._property.y * v.y;
	}

    // 计算与另一个Vector2实例的cos值: value
    getCosVector2( v ) {
        this.normalize();
        var r = this.dot( v.normalize() );
        return r;
    }

    // 计算与另一个Vector3实例的叉积: vec3
    crossVector2( v ) {
		return this.cross( this, v );
	}

    cross( a, b ) {
		const ax = a.x, ay = a.y;
		const bx = b.x, by = b.y;
        return {
            x: ay * bx - ax * by,
            y: ax * by - ay * bx
        }
        
	}
    
};

export { Vector2 }