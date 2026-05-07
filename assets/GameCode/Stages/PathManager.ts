// assets/GameCode/Stages/PathManager.ts
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PathManager')
export class PathManager extends Component {
    @property([Node]) waypoints: Node[] = [];

    public getWaypoints(): Node[] {
        return this.waypoints;
    }

    public getPointPosition(index: number) {
        if (index >= 0 && index < this.waypoints.length) {
            return this.waypoints[index].worldPosition;
        }
        return null;
    }
}
