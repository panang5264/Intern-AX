import { _decorator, assert, Component, Node, Prefab, instantiate, CCFloat, director } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { Bullet } from './bullet'
import { ITower } from './ITower';
import { BUFF_SPD_SCALE, BuffType } from './BuffType';
const { ccclass, property } = _decorator;

@ccclass('AttackTower')
export class AttackTower extends Component implements ITower {
    @property({ type: DetectionArea })
    detectionArea: DetectionArea;

    @property({ type: Prefab })
    public bullet: Prefab = null;

    @property({ type: CCFloat })
    public cooldown = 0.5;
    private cur_cooldown = 0;
    private enemyList: Array<Node> = new Array();
    public buffSet: Set<BuffType> = new Set();


    public InTowerRangeBound: (node: Node) => void;
    public OutTowerRangeBound: (node: Node) => void;

    protected start(): void {
        if (this.detectionArea == null) {
            this.detectionArea = this.node.getComponentInChildren(DetectionArea)
        }
        assert(this.enemyList != null, "enemy_list is null or undefine")

        this.InTowerRangeBound = this.InTowerRange.bind(this);
        this.OutTowerRangeBound = this.OutTowerRange.bind(this)
        this.detectionArea.addListener(DetectionType.Enter, this.InTowerRangeBound);
        this.detectionArea.addListener(DetectionType.Leave, this.OutTowerRangeBound);
    }

    getBuff(buff: BuffType): void {
        if (!this.buffSet.has(buff)) {
            this.buffSet.add(buff);
            switch (buff) {
                case BuffType.IncAtkSpd:
                    this.cooldown *= BUFF_SPD_SCALE;
                    break;
            }
        }
    }
    removeBuff(buff: BuffType): void {
        if (this.buffSet.has(buff)) {
            this.buffSet.delete(buff);
            switch (buff) {
                case BuffType.IncAtkSpd:
                    this.cooldown /= BUFF_SPD_SCALE;
                    break;
            }
        }
    }

    InTowerRange(enemy: Node): void {
        // this.node.lookAt(enemy.worldPosition, Vec3.UP)
        this.enemyList.push(enemy)
    }
    OutTowerRange(enemy: Node): void {
        const i = this.enemyList.indexOf(enemy)
        if (i !== -1) {
            this.enemyList.splice(i, 1)
        }
    }

    protected onDisable(): void {
        this.detectionArea.removeListener(DetectionType.Enter, this.InTowerRangeBound)
        this.detectionArea.removeListener(DetectionType.Leave, this.OutTowerRangeBound)
    }

    protected update(dt: number): void {
        if (this.enemyList.length === 0) {
            return
        }

        this.cur_cooldown += dt;
        if (this.cur_cooldown >= this.cooldown) {
            this.cur_cooldown = 0;
            let first_enemy = this.enemyList[0];

            let node = instantiate(this.bullet)
            node.worldPosition = this.node.position;
            node.parent = director.getScene().getChildByName("Canvas");
            node.getComponent(Bullet).target = first_enemy;
        }

    }
}
