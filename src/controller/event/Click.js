class Click {
    // static CONSOLE_CLICK_MESSAGE = true;
    constructor( DOMElement ) {
        DOMElement.addEventListener( 'click', ( e ) => {
            if ( Click.CONSOLE_CLICK_MESSAGE ) {
                console.log( 'clientX:',e.clientX, 'clientY:',e.clientY );
                console.log( e )
            }
        });
    }
    
}
export { Click }