class TouchTwoFinger {
    constructor( DOMElement ) {
        this.DOMElement = DOMElement;

        this.startAX = null;
        this.startAY = null;
        this.startBX = null;
        this.startBY = null;

        this.momentAX = null;
        this.momentAY = null;
        this.momentBX = null;
        this.momentBY = null;

        this.Distance = 0;
        this.firstDistance = 0;

        this.deltaDistance = 0;

        this.decayFactor = 0.99;
        this.maxSpeed = 20;
        this.tsx = 1.0;
        this.tsy = 0.0;
        
        this.DOMElement.addEventListener('touchstart', this.onMouseDown.bind(this), {passive:false});
        this.DOMElement.addEventListener('touchmove', this.onMouseMove.bind(this), {passive:false});
        this.DOMElement.addEventListener('touchend', this.onMouseUp.bind(this), {passive:false});
    }
    onMouseDown(e) {
        e.preventDefault();
        if ( e.touches[0] != undefined && e.touches[1] != undefined ) {
            this.startAX = e.touches[0].clientX;
            this.startAY = e.touches[0].clientY;
            this.startBX = e.touches[1].clientX;
            this.startBY = e.touches[1].clientY;
            this.firstDistance = this.getDistance( this.startAX,this.startAY,this.startBX,this.startBY);
        }
    }

    onMouseMove(e) {
        e.preventDefault();
        if ( e.touches[0] != undefined && e.touches[1] != undefined ) {
            this.startAX = e.touches[0].clientX;
            this.startAY = e.touches[0].clientY;
            this.startBX = e.touches[1].clientX;
            this.startBY = e.touches[1].clientY;
            this.Distance = this.getDistance( this.startAX,this.startAY,this.startBX,this.startBY);
        }
    }

    onMouseUp(e) {
        e.preventDefault();
        this.startAX = null;
        this.startAY = null;
        this.startBX = null;
        this.startBY = null;
    }

    getDistance( ax, ay, bx, by ) {
        return Math.hypot(bx - ax, by- ay);
    }
    getData() {
        this.deltaDistance = (this.firstDistance - this.Distance);
        this.firstDistance = this.Distance;
        
    }
} 
export { TouchTwoFinger }