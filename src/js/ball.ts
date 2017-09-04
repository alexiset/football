import {FootballObject} from './object';
import {FIELD_WIDTH, FIELD_HEIGHT} from './field';

export class Ball extends FootballObject {

    protected scene: any;
    protected mesh: any;

    protected startX: number;
    protected startZ: number;
    protected targetX: number;
    protected targetZ: number;

    isRun = false;
    isLoaded = false;

    constructor(scene: any) {
        super(scene);

        this.load();
    }

    load() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.ObjectLoader();
            const textureLoader = new THREE.TextureLoader();

            textureLoader.load('/resources/textures/ball.jpg', (texture: any) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture
                });

                loader.load('/resources/models/ball.json', (object: any) => {
                    this.mesh = new THREE.Mesh(object.children[0].geometry, material);
                    this.mesh.scale.set(.01, .01, .01);
                    this.scene.add(this.mesh);

                    this.isLoaded = true;
                    resolve();
                });
            });
        });
    }

    moveTo(x: number, z: number) {
        this.startX = this.mesh.position.x;
        this.startZ = this.mesh.position.z;
        this.targetX = x;
        this.targetZ = z;
        this.isRun = true;
    }

    animate() {
        if (this.isRun) {
            const distanceX = this.targetX - this.startX;
            const distanceZ = this.targetZ - this.startZ;
            const newX = this.mesh.position.x + distanceX / 20;
            const newZ = this.mesh.position.z + distanceZ / 20;
            let isRun = false;

            if (
                ((distanceX > 0 && this.mesh.position.x < this.targetX) || (distanceX < 0 && this.mesh.position.x > this.targetX))
                && newX > - FIELD_WIDTH / 2
                && newX < FIELD_WIDTH / 2
            ) {
                this.mesh.position.x = newX;
                isRun = true;
            }

            if (
                ((distanceZ > 0 && this.mesh.position.z < this.targetZ) || (distanceZ < 0 && this.mesh.position.z > this.targetZ))
                && newZ > - FIELD_HEIGHT / 2
                && newZ < FIELD_HEIGHT / 2
            ) {
                this.mesh.position.z = newZ;
                isRun = true;
            }

            this.calcPositionY();

            this.isRun = isRun;
        }
    }

    protected calcPositionY() {
        const distanceX = this.targetX - this.startX;
        const distanceZ = this.targetZ - this.startZ;
        const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        const currentX = this.targetX - this.mesh.position.x;
        const currentZ = this.targetZ - this.mesh.position.z;
        const currentDistance = Math.sqrt(currentX * currentX + currentZ * currentZ);

        if (currentDistance < distance / 2) {
            this.mesh.position.y -= .01;
        } else {
            this.mesh.position.y += .01;
        }

        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
        }
    }

}