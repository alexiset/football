import {FootballObject} from './object';

export class Gate extends FootballObject {

    protected mesh: any;

    load() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TDSLoader();

            loader.load('/resources/models/gate.3ds', (object: any) => {
                this.mesh = new THREE.Mesh(object.children[0].geometry, new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
                this.mesh.scale.set(.15, .15, .15);
                this.scene.add(this.mesh);
                resolve();
            });
        });
    }

}