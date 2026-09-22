class Loader{
    constructor(config = {url: null}) {
        this.url = config.url;
    }
    async readArrayBuffer( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const buffer = await response.arrayBuffer();
                file = new DataView(buffer);
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file
    }
    
    async readJson( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        let obj = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                file = await response.json();
                // obj = JSON.parse( file );
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file;
    }
    async readText( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                file = await response.text();
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file
    }
    
    static async loadImageBitmap( url ) {
        if (!url) throw new Error('URL is required');
        const response = await fetch(url);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        if (imageBitmap.width === 0 || imageBitmap.height === 0) {
            throw new Error('Invalid image size');
        }
        return imageBitmap;
    }

    async loadImageBitmap( url ) {
        if (!url) throw new Error('URL is required');
        const response = await fetch(url);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        if (imageBitmap.width === 0 || imageBitmap.height === 0) {
            throw new Error('Invalid image size');
        }
        return imageBitmap;
    }
    static async readText( url ) {
        if (!url) throw new Error('URL is required');
        let file = null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                file = await response.text();
        } catch (error) {
            console.error('file Load Error:', error);
            throw error;
        }
        return file
    }
    parseUint8ArraytoChar( dataView, offset, length = 4 ) {
        return String.fromCharCode(...new Uint8Array( dataView.buffer, offset, length ));
    }
    dataviewToObject() {
        
    }
    detection() {

    }
}
export { Loader }