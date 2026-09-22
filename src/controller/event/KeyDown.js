class KeyDown {

    static NUMBER_JUDGMENT = true;
    static CONSOLE_KEY_MESSAGE = true;

    constructor( DOMElement ) {

        this.keyList = [];

        DOMElement.addEventListener( 'keydown', ( e ) => {
            this.updata( e.keyCode )
            if ( KeyDown.CONSOLE_KEY_MESSAGE ) {
                // console.log( 'name:',e.key,'code:',e.keyCode );
            }
        });
    }

    bindKey( keyCode, object, property, stepLength = 1,  ) {
        if ( ( typeof keyCode ) !== 'number' || keyCode == 'NaN' ) return;
        if ( ( typeof property ) !== 'string' ) return;
        if ( ( typeof stepLength ) !== 'number' || stepLength == 'NaN' || stepLength == 0 ) return;
        this.forKeyLest( { keyCode, object, property, stepLength })
    }

    forKeyLest(object) {
        for (const obj of this.keyList) {
            if (obj === object) {
                return;
            }
            if (obj.keyCode === object.keyCode) {
                obj.object == object.object;
                obj.property == object.property;
                obj.stepLength = object.stepLength;
                return;
            }
        }
        this.keyList.push(object);
    }

    updata( keyCode ) {
        for ( let obj of this.keyList ) {
            if ( obj.keyCode === keyCode ) {
                obj.object[obj.property] = obj.object[obj.property] + obj.stepLength;
            }
        }
    }
}
export { KeyDown }