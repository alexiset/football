import { Field } from './field';
import { FootballObject } from './object';
import { BASE_URL } from './const';

export enum PlayerType {
    DEFENDER,
    MIDFIELDER,
    FORWARD
}

export class Player extends FootballObject {

    protected scene: any;
    protected mesh: any;

    protected type: PlayerType;
    protected startX: number;
    protected startZ: number;
    protected targetX: number;
    protected targetZ: number;

    isActive = true;
    isRun = false;
    isCurrent = false;

    static ready: Promise<any>;
    static meshes: any[] = [];

    static load(scene: any, model: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const loader = new THREE.SEA3D({
                autoPlay: true,
                container: scene,
                multiplier: .6
            });

            loader.onComplete = () => {
                const mesh: any = loader.getMesh('Player');
                const hat = loader.getMesh('Hat');

                if (hat) {
                    hat.visible = false;
                }

                mesh.scale.set(.02, .02, .02);
                // mesh.scale.set(.1, .1, .1);
                mesh.position.y = 2;
                mesh.visible = false;

                Player.meshes.push(mesh);

                resolve();
            };
            loader.load(`${ BASE_URL }/resources/models/${model}`);
        });
    }

    clone() {
        this.mesh = Player.meshes[0].clone();
        this.idleStatic();
        this.scene.add(this.mesh);
    }

    setTexture(textureName: string) {
        const loader = new THREE.TextureLoader();

        loader.load(`${ BASE_URL }/resources/textures/${textureName}`, (texture: any) => {
            this.mesh.material = this.mesh.material.clone();
            texture.flipY = false;
            this.mesh.material.map = texture;
        });
    }

    idleStatic() {
        this.mesh.play('idle', .5);
    }

    idleDynanic() {
        if (!this.isRun && !this.isCurrent) {
            this.moveTo(this.mesh.position.x + Math.random() * 20 - 10, this.mesh.position.z);
        }
    }

    run() {
        this.mesh.play('run', .5);
    }

    show() {
        this.mesh.visible = true;
    }

    hide() {
        this.mesh.visible = false;
    }

    getType(): PlayerType {
        return this.type;
    }

    setType(type: PlayerType) {
        this.type = type;
    }

    moveTo(x: number, z: number) {
        this.startX = this.mesh.position.x;
        this.startZ = this.mesh.position.z;
        this.targetX = x;
        this.targetZ = z;
        this.isRun = true;
    }

    animate(options: any) {
        if (this.isRun) {
            const distanceX = this.targetX - this.startX;
            const distanceZ = this.targetZ - this.startZ;
            const newX = this.mesh.position.x + .05 * (distanceX > 0 ? 1 : -1);
            const newZ = this.mesh.position.z + .05 * (distanceZ > 0 ? 1 : -1);

            let isRun = false;

            if (Field.isInsideByX(newX) && ((distanceX > 0 && this.mesh.position.x < this.targetX) || (distanceX < 0 && this.mesh.position.x > this.targetX))) {
                this.mesh.position.x = newX;
                isRun = true;
            }

            if (Field.isInsideByZ(newZ) && ((distanceZ > 0 && this.mesh.position.z < this.targetZ) || (distanceZ < 0 && this.mesh.position.z > this.targetZ))) {
                this.mesh.position.z = newZ;
                isRun = true;
            }

            this.isRun = isRun;
            this.run();
        } else if (this.isCurrent) {
            // this.run();
        } else if (!options.isStarted) {
            this.idleStatic();
        } else {
            this.idleDynanic();
        }
    }

    static init(scene: any): Promise<any> {
        if (!Player.ready) {
            Player.ready = new Promise((resolve, reject) => {
                Promise.all([
                    Player.load(scene, 'player1.sea')
                ])
                    .then(resolve)
                    .catch(reject);
            });
        }

        return Player.ready;
    }

}