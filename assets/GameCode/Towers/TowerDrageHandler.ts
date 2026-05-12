// assets/GameCode/Towers/TowerDragHandler.ts

import { _decorator, Component, Node, Prefab, instantiate, EventTouch, Vec3, director, Color, Sprite, CCFloat } from 'cc';
import { TowerController } from './TowerController';
import { ResourceManager } from '../CoreSystems/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('TowerDragHandler')
export class TowerDragHandler extends Component {

    @property(Prefab) public towerPrefab: Prefab = null;
    @property(String) public towerName: string = "Archer";
    @property(CCFloat) public towerCost: number = 100;

    private _ghostTower: Node | null = null;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onDragStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onDragMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onDragEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onDragEnd, this);
    }

    private onDragStart(event: EventTouch) {
        if (!this.towerPrefab) return;

        // สร้าง ghost tower
        this._ghostTower = instantiate(this.towerPrefab);
        this._ghostTower.parent = director.getScene().getChildByName("Canvas");

        // ปิดการทำงานของ TowerController ชั่วคราว
        const controller = this._ghostTower.getComponent(TowerController) || this._ghostTower.getComponent("AttackTower");
        if (controller) (controller as any).enabled = false;

        // ทำให้ ghost โปร่งใส
        const sprite = this._ghostTower.getComponent(Sprite) || this._ghostTower.getComponentInChildren(Sprite);
        if (sprite) sprite.color = new Color(255, 255, 255, 150);
    }

    private onDragMove(event: EventTouch) {
        if (!this._ghostTower) return;

        const touchPos = event.getUILocation();
        this._ghostTower.setWorldPosition(new Vec3(touchPos.x, touchPos.y, 0));
    }

    private onDragEnd(event: EventTouch) {
        if (!this._ghostTower) return;

        // --- เช็คเงินก่อนซื้อ ---
        const canAfford = ResourceManager.instance && ResourceManager.instance.spendGold(this.towerCost);

        if (canAfford) {
            // ถ้าเงินพอ -> ส่งข้อมูลไปยัง Slot พร้อม cost
            const worldPos = this._ghostTower.getWorldPosition();
            director.getScene().emit("TOWER_DROPPED", {
                prefab: this.towerPrefab,
                worldPosition: worldPos,
                towerName: this.towerName,
                cost: this.towerCost
            });
            console.log(`[Shop] ซื้อป้อม ${this.towerName} สำเร็จ! (-${this.towerCost} Gold)`);
        } else {
            // ถ้าเงินไม่พอ -> แสดงข้อความเตือน
            console.log(`[Shop] เงินไม่พอซื้อป้อม ${this.towerName}!`);
        }

        // ลบร่างเงา ghost ไม่ว่าจะซื้อสำเร็จหรือไม่
        this._ghostTower.destroy();
        this._ghostTower = null;
    }
}
