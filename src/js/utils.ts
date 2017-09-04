import {FootballObject} from './object';

export class Utils {

    static getDistance(obj1: FootballObject, obj2: FootballObject): number {
        if (obj1 && obj2) {
            const distanceX = obj1.getPositionX() - obj2.getPositionX();
            const distanceZ = obj1.getPositionZ() - obj2.getPositionZ();

            return Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
        }
    }

}