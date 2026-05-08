import { _decorator, Component, Node, Vec3 } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { BaseManager } from '../CoreSystems/BaseManager';
const { ccclass, property } = _decorator;

@ccclass('EnemyMovement')
export class EnemyMovement extends Component {
    @property({ type: PathManager }) pathManager: PathManager = null;
    @property speed: number = 2;

    private _waypoints: Node[] = [];
    private _targetIndex: number = 0;

    start() {
        if (this.pathManager) {
            this._waypoints = this.pathManager.getWaypoints();
            if (this._waypoints.length > 0) {
                this.node.worldPosition = this._waypoints[0].worldPosition;
                this._targetIndex = 1;
            }
        }
    }

    public set_path_manager(pathManager: PathManager) {
        this.pathManager = pathManager
    }

    update(dt: number) {
        if (this._targetIndex >= this._waypoints.length) return;

        const targetPos = this._waypoints[this._targetIndex].worldPosition;
        const currentPos = this.node.worldPosition;
        const stepLen = this.speed * dt;
        const remaining = Vec3.distance(currentPos, targetPos);

        if (remaining <= stepLen) {
            this.node.worldPosition = targetPos;
            this._targetIndex++;
            if (this._targetIndex >= this._waypoints.length) {
                this.reachGoal();
            }
            return;
        }

        let dir = new Vec3();
        Vec3.subtract(dir, targetPos, currentPos);
        dir.normalize();

        let moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, dir, stepLen);
        let nextPos = new Vec3();
        Vec3.add(nextPos, currentPos, moveStep);
        this.node.worldPosition = nextPos;
    }

    private reachGoal() {
        console.log("ศัตรูถึงฐานแล้ว!");
        BaseManager.instance.takeDamage(1);
        this.node.destroy();
    }
}
