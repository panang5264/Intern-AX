import { _decorator, Component, Node, Prefab, instantiate, CCFloat, director, Vec3 } from 'cc';
import { DetectionArea, DetectionType } from '../../Test/detection_area';
import { Bullet } from '../../Test/bullet';

const { ccclass, property } = _decorator;

@ccclass('TowerController')
export class TowerController extends Component {
    @property({ type: DetectionArea })
    public detectionArea: DetectionArea = null;

    @property({ type: Prefab })
    public bulletPrefab: Prefab = null;

    @property({ type: CCFloat })
    public attackCooldown: number = 0.5;

    private _enemyList: Node[] = [];
    private _timer: number = 0;

    protected start() {
        if (!this.detectionArea) {
            this.detectionArea = this.getComponentInChildren(DetectionArea);
        }

        if (this.detectionArea) {
            this.detectionArea.addListener(DetectionType.Enter, this.onEnemyEnter.bind(this));
            this.detectionArea.addListener(DetectionType.Leave, this.onEnemyLeave.bind(this));
        }
    }

    private onEnemyEnter(enemy: Node) {
        if (enemy && this._enemyList.indexOf(enemy) === -1) {
            this._enemyList.push(enemy);
        }
    }

    private onEnemyLeave(enemy: Node) {
        const index = this._enemyList.indexOf(enemy);
        if (index !== -1) {
            this._enemyList.splice(index, 1);
        }
    }

    protected update(dt: number) {

        this._enemyList = this._enemyList.filter(enemy => enemy && enemy.isValid);

        if (this._enemyList.length > 0) {
            this._timer += dt;
            if (this._timer >= this.attackCooldown) {
                this.shoot();
                this._timer = 0;
            }
        } else {
            this._timer = this.attackCooldown;
        }
    }

    private shoot() {
        const target = this._enemyList[0];
        if (!target || !this.bulletPrefab) return;

        const bulletNode = instantiate(this.bulletPrefab);

        const canvas = director.getScene().getChildByName("Canvas");
        bulletNode.parent = canvas ? canvas : this.node.parent;

        const myPos = new Vec3();
        this.node.getWorldPosition(myPos);
        bulletNode.setWorldPosition(myPos);


        const bulletComp = bulletNode.getComponent(Bullet);
        if (bulletComp) {
            bulletComp.target = target;
        }

    }
    public getBuff(buffType: any) {
        console.log(`[Buff] ป้อม ${this.node.name} ได้รับบัฟ: ${buffType}`);
    }
    public removeBuff(buffType: any) {
        console.log(`[Buff] ป้อม ${this.node.name} ยกเลิกบัฟ: ${buffType}`);


    }
}
