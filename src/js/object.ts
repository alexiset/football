export abstract class FootballObject {

    protected abstract mesh: any;
    protected scene: any;

    constructor(scene: any) {
        this.scene = scene;
    }

    setPositionX(x: number) {
        this.mesh.position.x = x;
    }

    setPositionY(y: number) {
        this.mesh.position.y = y;
    }

    setPositionZ(z: number) {
        this.mesh.position.z = z;
    }

    getPositionX(): number {
        return this.mesh.position.x;
    }

    getPositionY(): number {
        return this.mesh.position.y;
    }

    getPositionZ(): number {
        return this.mesh.position.z;
    }

    setRotateX(angle: number) {
        this.mesh.rotateX(angle * Math.PI / 180);
    }

    setRotateY(angle: number) {
        this.mesh.rotateY(angle * Math.PI / 180);
    }

    setRotateZ(angle: number) {
        this.mesh.rotateZ(angle * Math.PI / 180);
    }

}