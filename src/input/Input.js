import { Vector2 } from "../Module.js";

class Input {
    constructor(config={DOMElement: null}) {

        this.start = new Vector2();
        this.moment = new Vector2();
        this.delta = new Vector2();
        this.damper = new Vector2( 0.99, 0.99 );

        this.isMouseDown = false;
        this.isMouseMove = false;

        this.DOMElement = config.DOMElement;
        this.setInput();
    }

    setElement(DOMElement) {
        if (!DOMElement) return;
        this.DOMElement = DOMElement;
        this.setInput();
        return this;
    }

    setInput() {
        if (!this.DOMElement) return;
        this.DOMElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.DOMElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.DOMElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.DOMElement.addEventListener('mouseleave', this.onMouseleave.bind(this));
    }

    // event call
    onMouseDown(e) {
        if (e.button !== 0) return;
        this.isMouseDown = true;
        this.start.x = e.clientX;
        this.start.y = e.clientY;
    }

    onMouseMove(e) {
        if (e.button !== 0) return;
        this.isMouseMove = true;
        if ( this.isMouseDown) {
            this.moment.x = e.clientX;
            this.moment.y = e.clientY;
            this.delta.x = this.moment.x - this.start.x;
            this.delta.y = this.moment.y - this.start.y;
            this.start.x = this.moment.x;
            this.start.y = this.moment.y;
        }
    }

    onMouseUp(e) {
        if (e.button !== 0) return;
        this.isMouseDown = false;
    }

    onMouseleave(e) {
        this.isMouseDown = false;
    }

    invoke( call ) {
        if (typeof call !== 'function' ) return;
        call(this.delta.x,this.delta.y);
    }

    clean() {
        this.delta.x *= this.damper.x;
        this.delta.y *= this.damper.y;
    }

    destroy() {

    }
}
export {
    Input
}