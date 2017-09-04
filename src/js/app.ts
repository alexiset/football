import {Team} from './team';
import {Field, FIELD_HEIGHT, FIELD_WIDTH} from './field';
import {Ball} from './ball';
import {Gate} from './gate';
import {Player} from './player';
import {Utils} from './utils';

export class App {

    protected scene: any;
    protected camera: any;
    protected renderer: any;

    protected mouseX: number;
    protected mouseY: number;

    protected clock: any;
    protected ball: Ball;
    protected field: Field;
    protected playerTeam: Team;
    protected cpuTeam: Team;
    protected leftGate: Gate;
    protected rightGate: Gate;
    protected currentPlayerPoint: any;

    protected isUpKey = false;
    protected isDownKey = false;
    protected isLeftKey = false;
    protected isRightKey = false;

    protected isStarted = false;

    constructor() {
        this.createScene();
        this.createCamera();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);

        this.clock = new THREE.Clock();

        this.createLight();

        this.camera.position.z = 18;
        this.camera.position.y = 25;
        this.camera.rotation.x = -45 * Math.PI / 180;

        this.field = new Field(this.scene);
        this.ball = new Ball(this.scene);
        this.createGates();
        this.createTeams();

        this.createRenderer();
        this.animate();
    }

    protected createScene() {
        this.scene = new THREE.Scene();
    }

    protected createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    protected createLight() {
        const ambient = new THREE.AmbientLight(0x444444);
        const directionalLightFront = new THREE.DirectionalLight(0xffeedd);
        const directionalLightBack = new THREE.DirectionalLight(0xffeedd);

        directionalLightFront.position.set(0, 0, 1).normalize();
        directionalLightBack.position.set(0, 0, -1).normalize();

        this.scene.add(ambient);
        this.scene.add(directionalLightFront);
        this.scene.add(directionalLightBack);
    }

    protected createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.updateRendererSize();
        document.body.appendChild(this.renderer.domElement);
    }

    protected updateRendererSize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    protected animate() {
        const delta = this.clock.getDelta();
        const currentPlayer = this.playerTeam.getCurrentPlayer();
        const cpuCurrentPlayer = this.cpuTeam.getCurrentPlayer();

        window.requestAnimationFrame(() => this.animate());

        const step = .1;

        if (this.isStarted) {
            if (currentPlayer) {
                if (this.isUpKey && currentPlayer.getPositionZ() - step > -FIELD_HEIGHT / 2) {
                    currentPlayer.setPositionZ(currentPlayer.getPositionZ() - step);
                }
                if (this.isDownKey && currentPlayer.getPositionZ() + step < FIELD_HEIGHT / 2) {
                    currentPlayer.setPositionZ(currentPlayer.getPositionZ() + step);
                }
                if (this.isLeftKey && currentPlayer.getPositionX() - step > -FIELD_WIDTH / 2) {
                    currentPlayer.setPositionX(currentPlayer.getPositionX() - step);
                }
                if (this.isRightKey && currentPlayer.getPositionX() + step < FIELD_WIDTH / 2) {
                    currentPlayer.setPositionX(currentPlayer.getPositionX() + step);
                }

                if (!this.isUpKey && !this.isDownKey && !this.isLeftKey && !this.isRightKey) {
                    currentPlayer.isRun = false;
                } else {
                    currentPlayer.isRun = true;
                }

                this.currentPlayerPoint.position.x = currentPlayer.getPositionX();
                this.currentPlayerPoint.position.z = currentPlayer.getPositionZ();
            }

            if (this.ball && this.ball.isLoaded && !this.ball.isRun) {
                if (this.playerTeam.withBall && currentPlayer) {
                    this.ball.setPositionX(currentPlayer.getPositionX() + 1.5);
                    this.ball.setPositionZ(currentPlayer.getPositionZ() - 1);
                } else if (this.cpuTeam.withBall && cpuCurrentPlayer) {
                    this.ball.setPositionX(cpuCurrentPlayer.getPositionX() - 1.5);
                    this.ball.setPositionZ(cpuCurrentPlayer.getPositionZ() - 1);
                }
            }

            if (!this.playerTeam.withBall && !this.ball.isRun) {
                const nearestPlayerToBall: Player = this.playerTeam.getNearestPlayer(this.ball);
                const distanceNearest = Utils.getDistance(nearestPlayerToBall, this.ball);
                const distanceCurrent = Utils.getDistance(this.playerTeam.getCurrentPlayer(), this.ball);

                if (Math.abs(distanceNearest - distanceCurrent) > 5) {
                    this.playerTeam.setCurrentPlayer(nearestPlayerToBall);
                }

                const distance = Utils.getDistance(this.playerTeam.getCurrentPlayer(), this.ball);

                if (distance < 2 && this.playerTeam.getCurrentPlayer().isActive) {
                    if (this.cpuTeam.withBall) {
                        this.cpuTeam.getCurrentPlayer().isActive = false;
                        setTimeout(() => this.cpuTeam.getCurrentPlayer().isActive = true, 3000);
                    }

                    this.playerTeam.withBall = true;
                    this.cpuTeam.withBall = false;

                    this.cpuTeam.setStrategy('defense');
                    this.playerTeam.setStrategy('attack');
                }
            }

            if (!this.cpuTeam.withBall) {
                const nearestPlayerToBall: Player = this.cpuTeam.getNearestPlayer(this.ball);
                const distance = Utils.getDistance(nearestPlayerToBall, this.ball);

                if (nearestPlayerToBall) {
                    this.cpuTeam.setCurrentPlayer(nearestPlayerToBall);
                    nearestPlayerToBall.moveTo(this.ball.getPositionX(), this.ball.getPositionZ());

                    if (distance < 1) {
                        this.playerTeam.getCurrentPlayer().isActive = false;
                        setTimeout(() => this.playerTeam.getCurrentPlayer().isActive = true, 3000);

                        this.playerTeam.withBall = false;
                        this.cpuTeam.withBall = true;

                        this.cpuTeam.setStrategy('attack');
                        this.playerTeam.setStrategy('defense');
                    }
                }
            }

            if (this.cpuTeam.withBall && cpuCurrentPlayer) {
                cpuCurrentPlayer.moveTo(this.leftGate.getPositionX(), this.leftGate.getPositionZ());

                const distanceToGate = Utils.getDistance(cpuCurrentPlayer, this.leftGate);

                if (distanceToGate < 10) {
                    this.ball.moveTo(this.leftGate.getPositionX(), this.leftGate.getPositionZ());
                    this.cpuTeam.withBall = false;
                }
            }

            if (
                this.ball.getPositionX() + 2 > this.rightGate.getPositionX()
                && this.ball.getPositionZ() < 2.2
                && this.ball.getPositionZ() > -3.3
            ) {
                this.playerTeam.goal();
                this.updateScore();
                this.isStarted = false;
                setTimeout(() => this.reset(), 3000);
            }

            if (
                this.ball.getPositionX() - 2 < this.leftGate.getPositionX()
                && this.ball.getPositionZ() < 2.2
                && this.ball.getPositionZ() > -3.3
            ) {
                this.cpuTeam.goal();
                this.updateScore();
                this.isStarted = false;
                setTimeout(() => this.reset(), 3000);
            }
        }

        this.playerTeam.animate({
            isStarted: this.isStarted
        });
        this.cpuTeam.animate({
            isStarted: this.isStarted
        });
        this.ball.animate();

        THREE.SEA3D.AnimationHandler.update(delta);

        this.renderer.render(this.scene, this.camera);
    }

    protected reset() {
        const currentPlayer = this.playerTeam.getCurrentPlayer();

        this.ball.setPositionX(0);
        this.ball.setPositionZ(0);
        this.ball.isRun = false;
        this.playerTeam.setStartPositions();
        this.playerTeam.withBall = true;

        this.cpuTeam.setStartPositions();

        const players: Player[] = this.playerTeam.getPlayers();
        this.playerTeam.setCurrentPlayer(players[players.length - 1]);
        this.currentPlayerPoint.position.x = currentPlayer.getPositionX();
        this.currentPlayerPoint.position.z = currentPlayer.getPositionZ();
    }

    protected createGates() {
        const DELTA_X = 2;

        this.leftGate = new Gate(this.scene);
        this.rightGate = new Gate(this.scene);

        this.leftGate.load()
            .then(() => {
                this.leftGate.setPositionX(- FIELD_WIDTH / 2 + DELTA_X);
                this.leftGate.setPositionY(2);
                this.leftGate.setRotateX(-90);
                this.leftGate.setRotateZ(180);
            });

        this.rightGate.load()
            .then(() => {
                this.rightGate.setPositionX(FIELD_WIDTH / 2 - DELTA_X);
                this.rightGate.setPositionY(2);
                this.rightGate.setRotateX(-90);
            });
    }

    protected createTeams() {
        this.playerTeam = new Team(this.scene, {
            side: 'left'
        });
        this.cpuTeam = new Team(this.scene, {
            side: 'right'
        });

        this.playerTeam.createPlayers()
            .then(() => {
                const players: Player[] = this.playerTeam.getPlayers();

                this.playerTeam.setCurrentPlayer(players[players.length - 1]);

                // setTimeout(() => this.playerTeam.setStrategy('defense'), 10000);
            });
        this.playerTeam.withBall = true;

        this.cpuTeam.createPlayers()
            .then(() => {
                this.cpuTeam.setTexture('player.jpg');
                // this.cpuTeam.setStrategy('attack');
                // setTimeout(() => this.cpuTeam.setStrategy('defense'), 10000);
            });

        const geometry = new THREE.SphereGeometry(.4, 32, 32);
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.currentPlayerPoint = new THREE.Mesh(geometry, material);
        this.currentPlayerPoint.position.y = 6;
        this.scene.add(this.currentPlayerPoint);
    }

    protected updateScore() {
        document.querySelector('.score').innerHTML = `${this.playerTeam.getScore()}:${this.cpuTeam.getScore()}`;
    }

    protected onWindowResize() {
        this.updateRendererSize();
    }

    protected onDocumentMouseMove(event: MouseEvent) {
        this.mouseX = ( event.clientX - window.innerWidth / 2 ) / 2;
        this.mouseY = ( event.clientY - window.innerHeight / 2 ) / 2;
    }

    protected onDocumentKeyDown(event: KeyboardEvent) {
        this.isUpKey = event.keyCode === 38 ? true : this.isUpKey;
        this.isDownKey = event.keyCode === 40 ? true : this.isDownKey;
        this.isLeftKey = event.keyCode === 37 ? true : this.isLeftKey;
        this.isRightKey = event.keyCode === 39 ? true : this.isRightKey;

        switch (event.keyCode) {
            case 32:
                if (this.playerTeam.withBall) {
                    const nearest = this.playerTeam.getNearestForwardPlayer(this.playerTeam.getCurrentPlayer());

                    this.ball.moveTo(nearest.getPositionX() + 1.5, nearest.getPositionZ() - 1);
                    this.playerTeam.setCurrentPlayer(nearest);
                }

                if (!this.isStarted) {
                    this.playerTeam.setStrategy('attack');
                    this.cpuTeam.setStrategy('defense');

                    this.isStarted = true;
                }
                break;
            case 70:
                if (this.isStarted && this.playerTeam.withBall) {
                    this.ball.moveTo(this.playerTeam.getCurrentPlayer().getPositionX() + 15, this.playerTeam.getCurrentPlayer().getPositionZ());
                    this.playerTeam.withBall = false;
                }
                break;
        }
    }

    protected onDocumentKeyUp(event: KeyboardEvent) {
        this.isUpKey = event.keyCode === 38 ? false : this.isUpKey;
        this.isDownKey = event.keyCode === 40 ? false : this.isDownKey;
        this.isLeftKey = event.keyCode === 37 ? false : this.isLeftKey;
        this.isRightKey = event.keyCode === 39 ? false : this.isRightKey;
    }
}