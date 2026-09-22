class Matrix2x2 {
    constructor() {
        this._type = 'Matrix2x2';

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
            1, 0,
            0, 1
        ];
    }
    
    init() {
        this.element = Matrix3x3.init();
        this.status.needUpdate = true;
        return this
    }

    setScale( x = 1, y = 1 ) {
        this.element = [
            x, 0,
            0, y
        ]
        this.status.needUpdate = true;
        return this;
    }

    setEulerZ ( z = 0 ) {                                             
        let radZ = ( z * Math.PI ) / 180;
        let cz = Math.cos( radZ );
        let sz = Math.sin( radZ );
        this.element = [
            cz, sz,
            -sz, cz,
        ];
        this.status.needUpdate = true;
        return this
    }

}
export { Matrix2x2 }