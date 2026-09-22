class ViewController {
    constructor(config = {
        width: 200,
        height: 30,
        top: 10,
        right: 20,
    }) {
        // style
        this._width = config.width;
        this._height = config.height;
        this._right = config.right;
        this._top = config.top;
        this.name = 'ViewController';

        this.children= []
    }

    addGroup( name = 'name' ) {
        let group = {
            name,
            children:[],
            addBinding( name = 'name', type = 'value' ) { // value | color | button
                let binding = {
                    name
                }
                group.push( binding )
                return group;
            }
        }
        this.children.push(group);
        return group;
    }
    createDom(el) {
        let vc_css = `
            position: absolute;
            top: ${this._top}px;
            right:${this._right}px;
            width: ${this._width}px;
            z-index:1;
            background: rgba(110, 110, 110, 0.85);
            border-radius: 5px;
            backdrop-filter: blur(10px);
            display: flex;
            justify-content:center;
            color: #ffffff;
        `;
        let vc = document.createElement('div');
        vc.id = 'ViewController';
        vc.innerHTML = `<span style="height:30px;align-items:center;">${this.name}</span>`;
        vc.style.cssText = vc_css;
        el.appendChild(vc);

        let container_css = ``;
        let container = document.createElement('div');
        container.innerHTML = `<span style="height:30px;align-items:center;">${this.name}</span>`;
    }
    attach(el) {
        if ( !el ) return;
        el.parentNode.style.position = 'relative';
        this.createDom(el.parentNode);
    }
}
export { ViewController }
