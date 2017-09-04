import { BASE_URL } from './const';

export const FIELD_WIDTH = 70;
export const FIELD_HEIGHT = 15;

export class Field {

    protected scene: any;

    constructor(scene: any) {
        this.scene = scene;

        const loader = new THREE.TextureLoader();

        loader.load(`${ BASE_URL }/resources/textures/field.jpg`, (texture: any) => {
            const material = new THREE.MeshBasicMaterial({
                map: texture
            });
            const geometry = new THREE.PlaneGeometry(FIELD_HEIGHT, FIELD_WIDTH);
            const plane = new THREE.Mesh(geometry, material);
            plane.rotateX(-90 * Math.PI / 180);
            plane.rotateZ(90 * Math.PI / 180);
            this.scene.add(plane);
        }, (xhr: any) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (xhr: any) => {
            console.log('An error happened');
        });
    }

    static isInsideByX(x: number) {
        return x < FIELD_WIDTH / 2 && x > - FIELD_WIDTH / 2;
    }

    static isInsideByZ(z: number) {
        return z < FIELD_HEIGHT / 2 && z > - FIELD_HEIGHT / 2;
    }

}