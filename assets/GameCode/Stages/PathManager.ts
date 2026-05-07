// assets/GameCode/Stages/PathManager.ts
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PathManager')
export class PathManager extends Component {
    @property([Node]) waypoints: Node[] = [];

    protected start(): void {
        let children = this.node.children;
        children.forEach(child => {
            /* NOTE: use when create unorder waypoints or use WayPoints.id
             * let name = child.name
            name = name.split("_")[1]
            let id = parseInt(name)
            this.waypoints.splice(id - 1, 0, child) */
            this.waypoints.push(child)
        })
    }

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
