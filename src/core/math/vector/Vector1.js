class Vector1 {
    constructor( x = 0 ) {
        this._type = 'Vector1';
        this._name = 'Vector1';
        this._property = {
            x
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

    set( x = 0 ) { 
        if ( x === this._property.x) return;
        this._property.y = y;
        this.status.needUpdate = true;
    }

    // 返回一个数组:[x,y]
    toArray( length = 1 ) {
        return [ this._property.x ].slice( 0, length );
    }
    
};

export { Vector1 }