import { _decorator, assert, Component, Node, Vec3, math, EventTarget, Prefab, Quat } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends Component {
    @property({ type: DetectionArea })
    private detection_area: DetectionArea;
    private enemy_list: Array<Node> = new Array();
    // @property({ type: Prefab })
    // public bullet: Prefab
    @property({ type: Node })
    public bullet: Node

    public onDetectEnemyBound: (node: Node) => void;
    public onEnemyLeaveBound: (node: Node) => void;

    protected start(): void {
        if (this.detection_area === null) {
            this.detection_area = this.node.getComponentInChildren(DetectionArea)
        }
        assert(this.enemy_list != null, "enemy_list is null or undefine")
        this.onDetectEnemyBound = this.onDetectEnemy.bind(this);
        this.onEnemyLeaveBound = this.onEnemyLeave.bind(this)
        this.detection_area.addListener(DetectionType.Enter, this.onDetectEnemyBound);
        this.detection_area.addListener(DetectionType.Leave, this.onEnemyLeaveBound);

    }

    public onDetectEnemy(enemy: Node) {
        // this.node.lookAt(enemy.worldPosition, Vec3.UP)
        this.enemy_list.push(enemy)
    }

    public onEnemyLeave(enemy: Node) {
        const i = this.enemy_list.indexOf(enemy)
        if (i !== -1) {
            this.enemy_list.splice(i, 1)
        }
    }

    protected onDisable(): void {
        this.detection_area.removeListener(DetectionType.Enter, this.onDetectEnemyBound)
        this.detection_area.removeListener(DetectionType.Leave, this.onEnemyLeaveBound)
    }

    protected update(dt: number): void {
        if (this.enemy_list.length === 0) {
            return
        }
        let first_enemy = this.enemy_list[0];
        const direction = first_enemy.worldPosition.subtract(this.node.worldPosition).normalize();
        const radian = Math.atan2(direction.y, direction.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, -radian);
        this.bullet.setWorldRotation(quat)
    }
}
