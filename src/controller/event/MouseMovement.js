class MouseMovement {
    constructor( DOMElement ) {
        this.DOMElement = DOMElement;
        this.startX = null;
        this.startY = null;
        this.momentX = null;
        this.momentY = null;
        this.deltaY = 0;
        this.deltaX = 0;
        this.decayFactor = 0.999;
        this.maxSpeed = 30;
        this.tsx = 1.0;
        this.tsy = 0.0;

        this.DOMElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.DOMElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.DOMElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    onMouseDown(e) {
        if (e.button !== 0) return;
        // this.isMouseDown = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    onMouseMove(e) {
        if (e.button !== 0) return;
        // if (!this.isMouseDown) return;
        this.momentX = e.clientX;
        this.momentY = e.clientY;
    }

    onMouseUp(e) {
        if (e.button !== 0) return;
        // this.isMouseDown = false;
        this.startX = null;
        this.startY = null;
    }

    getData() {
        if ( this.startX == null && this.startY == null ) { // 这里以后可以优化性能
            if ( this.deltaX != 0 ) {
                this.deltaX = this.deltaX * this.decayFactor;
            }
            if ( this.deltaY != 0 ) {
                this.deltaY = this.deltaY * this.decayFactor;
            }
        }
        if ( this.startX != null && this.startY != null ) {
            this.deltaX = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.momentX - this.startX));
            this.deltaY = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.momentY - this.startY));
            this.startX = this.momentX;
            this.startY = this.momentY;
        }
    }
} 
export { MouseMovement }