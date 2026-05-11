import { _decorator, assert, Component, Node, Enum } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { AttackTower } from './AttackTower';
import { ITower } from './ITower';
import { BuffType } from './BuffType'
const { ccclass, property } = _decorator;

@ccclass('SupportTower')
export class SupportTower extends Component implements ITower {
    @property({ type: DetectionArea })
    detectionArea: DetectionArea;
    @property({ type: Enum(BuffType) })
    buff: BuffType;
    private towerList: Array<Node> = new Array();
    public InTowerRangeBound: (node: Node) => void;
    public OutTowerRangeBound: (node: Node) => void;

    protected start(): void {
        if (this.detectionArea == null) {
            this.detectionArea = this.node.getComponentInChildren(DetectionArea)
        }
        assert(this.towerList != null, "Tower List is null or undefine")

        this.InTowerRangeBound = this.InTowerRange.bind(this);
        this.OutTowerRangeBound = this.OutTowerRange.bind(this)
        this.detectionArea.addListener(DetectionType.Enter, this.InTowerRangeBound);
        this.detectionArea.addListener(DetectionType.Leave, this.OutTowerRangeBound);
    }
    InTowerRange(tower: Node): void {
        const t = tower.getComponent(AttackTower)
        t.getBuff(this.buff)
    }
    OutTowerRange(tower: Node): void {
        const t = tower.getComponent(AttackTower)
        t.removeBuff(this.buff)
    }
}
