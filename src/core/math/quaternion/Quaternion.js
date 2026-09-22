class Quaternion {
    constructor( x = 0, y = 0, z = 0, w = 1 ) {
        const lenSq = x * x + y * y + z * z + w * w;
        if (lenSq > 0) {
            const invLen = 1 / Math.sqrt(lenSq);
            x *= invLen;
            y *= invLen;
            z *= invLen;
            w *= invLen;

            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    }
}
export { Quaternion }
