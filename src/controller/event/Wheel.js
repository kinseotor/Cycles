class Wheel {
    constructor( DOMElement ) {
        this.DOMElement = DOMElement;
        this.message = {
            ZOOM_SENSITIVITY : 0.005,
            MIN_DISTANCE : 0.1,
            MAX_DISTANCE : 1000.0,
            ZOOM_DAMPING : 0.1,
        }
        this._deltaWheelY = 0
        this.DOMElement.addEventListener('wheel', this.onWheel.bind(this));
    }
    onWheel( e ) {
        e.preventDefault();
        this._deltaWheelY  += e.deltaY;
    }

    getData() {
        this.deltaWheelY = this._deltaWheelY;
        this._deltaWheelY = 0;
    }

}

export { Wheel }