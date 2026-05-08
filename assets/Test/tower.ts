import { _decorator, assert, Component, Node, Vec3, math, EventTarget, Prefab, Quat, instantiate, CCFloat, director, CCBoolean } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { Bullet } from './bullet'
const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends Component {
    @property({ type: DetectionArea })
    private detection_area: DetectionArea;
    private enemy_list: Array<Node> = new Array();
    // @property({ type: Prefab })
    // public bullet: Prefab
    @property({ type: Prefab })
    public bullet: Prefab = null;

    @property({ type: CCFloat })
    public cooldown = 0.5;
    private cur_cooldown = 0;

    @property({
        type: CCBoolean,
        displayName: "Support"
    })
    public is_support = false;

    public onInTowerRange: (node: Node) => void;
    public onOutTowerRange: (node: Node) => void;

    protected start(): void {
        if (this.detection_area == null) {
            this.detection_area = this.node.getComponentInChildren(DetectionArea)
        }
        assert(this.enemy_list != null, "enemy_list is null or undefine")
        if (!this.is_support) {
            assert(this.bullet != null, "insert bullet prefab")
        }

        this.onInTowerRange = this.onInRange.bind(this);
        this.onOutTowerRange = this.onOutOfRange.bind(this)
        this.detection_area.addListener(DetectionType.Enter, this.onInTowerRange);
        this.detection_area.addListener(DetectionType.Leave, this.onOutTowerRange);
    }

    public onInRange(enemy: Node) {
        // this.node.lookAt(enemy.worldPosition, Vec3.UP)
        this.enemy_list.push(enemy)
    }

    public onOutOfRange(enemy: Node) {
        const i = this.enemy_list.indexOf(enemy)
        if (i !== -1) {
            this.enemy_list.splice(i, 1)
        }
    }

    protected onDisable(): void {
        this.detection_area.removeListener(DetectionType.Enter, this.onInTowerRange)
        this.detection_area.removeListener(DetectionType.Leave, this.onOutTowerRange)
    }

    protected update(dt: number): void {
        if (this.enemy_list.length === 0) {
            return
        }
        if (this.cur_cooldown >= this.cooldown) {
            let first_enemy = this.enemy_list[0];
            let node = instantiate(this.bullet)
            node.worldPosition = this.node.position;
            node.parent = director.getScene().getChildByName("Canvas");
            let bullet = node.getComponent(Bullet);
            bullet.target_pos = first_enemy.getWorldPosition();

            this.cur_cooldown = 0;
        }

        this.cur_cooldown += dt;
    }
}
