import {Player, PlayerType} from './player';
import {FIELD_WIDTH, FIELD_HEIGHT} from './field';
import {Utils} from './utils';

export interface ITeamOptions {
    side: string;
}

export class Team {

    protected scene: any;
    protected options: ITeamOptions;
    protected players: Player[] = [];
    protected currentPlayer: Player;
    protected score = 0;

    withBall = false;

    constructor(scene: any, options: ITeamOptions) {
        this.scene = scene;
        this.options = options;
    }

    getPlayers(): Player[] {
        return this.players;
    }

    getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    setCurrentPlayer(player: Player) {
        // this.players.forEach((item: Player) => item.isCurrent = item === player);
        if (player) {
            player.isCurrent = true;
            this.currentPlayer = player;
        }
    }

    getNearestPlayer(point: any): Player {
        let min: number = Infinity,
            nearest: Player = null;

        this.players.forEach((item: Player) => {
            if (item !== point && item.isActive) {
                const distance = Utils.getDistance(item, point);

                if (distance < min) {
                    min = distance;
                    nearest = item;
                }
            }
        });

        return nearest;
    }

    getNearestForwardPlayer(point: any): Player {
        let min: number = Infinity,
            nearest: Player = null;

        this.players.forEach((item: Player) => {
            if (item !== point && item.isActive && item.getPositionX() > point.getPositionX()) {
                const distance = Utils.getDistance(item, point);

                if (distance < min) {
                    min = distance;
                    nearest = item;
                }
            }
        });

        return nearest || this.getNearestPlayer(point);
    }

    animate(options: any) {
        this.players.forEach((item: Player) => {
            item.animate(options);
        });
    }

    setStrategy(strategy: string) {
        const isLeft = this.options.side === 'left';

        switch (strategy) {
            case 'defense':
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.FORWARD && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(0, 4), item.getPositionZ());
                    });
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.MIDFIELDER && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(((isLeft ? - FIELD_WIDTH : FIELD_WIDTH) / 2) * .4, 4), item.getPositionZ());
                    });
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.DEFENDER && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(((isLeft ? - FIELD_WIDTH : FIELD_WIDTH) / 2) * .6, 4), item.getPositionZ());
                    });
                break;
            case 'attack':
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.FORWARD && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(((isLeft ? FIELD_WIDTH : - FIELD_WIDTH) / 2) * .7, 4), item.getPositionZ());
                    });
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.MIDFIELDER && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(((isLeft ? FIELD_WIDTH : - FIELD_WIDTH) / 2) * .5, 4), item.getPositionZ());
                    });
                this.players
                    .filter((item: Player) => item.getType() === PlayerType.DEFENDER && item !== this.currentPlayer)
                    .forEach((item: Player) => {
                        item.moveTo(this.getRandomPositionX(0, 4), item.getPositionZ());
                    });
                break;
        }
    }

    createPlayers() {
        return new Promise((resolve, reject) => {
            Player.init(this.scene)
                .then(() => {
                    const types: PlayerType[] = this.getPlayersType();

                    for (let i = 0; i < 10; i++) {
                        let player = new Player(this.scene);

                        player.clone();
                        if (this.options.side === 'left') {
                            player.setRotateY(90);
                        } else {
                            player.setRotateY(-90);
                        }
                        player.setType(types[i]);
                        player.show();
                        this.players.push(player);
                    }

                    this.setStartPositions();

                    resolve();
                });
        });
    }

    setStartPositions() {
        const startPositions: any[] = this.getStartPositions();

        this.players.forEach((item: Player, index: number) => {
            item.isRun = false;

            if (startPositions[index]) {
                item.setPositionX(startPositions[index].x);
                item.setPositionZ(startPositions[index].z);
            }
        })
    }

    setTexture(textureName: string) {
        this.players.forEach((item: Player) => item.setTexture(textureName));
    }

    getScore() {
        return this.score;
    }

    goal() {
        this.score++;
    }

    protected getRandomPosition(x: number, size?: number): number {
        size = size || 2;

        return  x + (Math.random() * size - Math.random() * size);
    }

    protected getRandomPositionX(x: number, size?: number) {
        let position = this.getRandomPosition(x, size);

        position = Math.min(position, FIELD_WIDTH / 2);
        position = Math.max(position, - FIELD_WIDTH / 2);

        return position;
    }

    protected getRandomPositionZ(z: number, size?: number) {
        let position = this.getRandomPosition(z, size);

        position = Math.min(position, FIELD_HEIGHT / 2);
        position = Math.max(position, - FIELD_HEIGHT / 2);

        return position;
    }

    protected getPlayersType(): PlayerType[] {
        return [
            PlayerType.DEFENDER,
            PlayerType.DEFENDER,
            PlayerType.DEFENDER,
            PlayerType.DEFENDER,
            PlayerType.MIDFIELDER,
            PlayerType.MIDFIELDER,
            PlayerType.MIDFIELDER,
            PlayerType.MIDFIELDER,
            PlayerType.FORWARD,
            PlayerType.FORWARD,
            PlayerType.FORWARD
        ]
    }

    protected getStartPositions() {
        const halfFieldWidth = FIELD_WIDTH / 2;
        const halfFieldHeight = FIELD_HEIGHT / 2;

        if (this.options.side === 'left') {
            return [
                {
                    x: this.getRandomPosition(- halfFieldWidth * .6),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .1)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .6),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .4)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .6),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .7)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .6),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .9)
                },

                {
                    x: this.getRandomPosition(- halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .1)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .4)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .7)
                },
                {
                    x: this.getRandomPosition(- halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .9)
                },

                {
                    x: this.getRandomPosition(- halfFieldWidth * .2),
                    z: 0
                },
                {
                    x: - 0,
                    z: - 0
                }
            ];
        } else {
            return [
                {
                    x: this.getRandomPosition(halfFieldWidth * .6),
                    z: - halfFieldHeight + FIELD_HEIGHT * .1
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .6),
                    z: - halfFieldHeight + FIELD_HEIGHT * .4
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .6),
                    z: - halfFieldHeight + FIELD_HEIGHT * .7
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .6),
                    z: - halfFieldHeight + FIELD_HEIGHT * .9
                },

                {
                    x: this.getRandomPosition(halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .1)
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .4)
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .7)
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .4),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .9)
                },

                {
                    x: this.getRandomPosition(halfFieldWidth * .2),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .3)
                },
                {
                    x: this.getRandomPosition(halfFieldWidth * .2),
                    z: this.getRandomPosition(- halfFieldHeight + FIELD_HEIGHT * .7)
                },
            ];
        }
    }
}