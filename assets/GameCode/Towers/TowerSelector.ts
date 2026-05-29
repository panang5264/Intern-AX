import { _decorator, Component, Input, input, EventTouch } from 'cc';
import { GameplayHUD } from '../UI/GameplayHUD';

const { ccclass } = _decorator;

/**
 * TowerSelector
 * ติดบน Tower Prefab แต่ละตัว
 * เมื่อผู้เล่นคลิกป้อมที่วางบนแผนที่ จะแจ้ง GameplayHUD ให้แสดงข้อมูลและปุ่ม Upgrade
 */
@ccclass('TowerSelector')
export class TowerSelector extends Component {
    protected onLoad(): void {
        // รับ touch/click บน node ของป้อมนี้
        this.node.on(Input.EventType.TOUCH_END, this.onTowerClicked, this);
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_END, this.onTowerClicked, this);

        // แจ้ง HUD ว่าป้อมตัวนี้ถูกลบออกแล้ว (ขาย / ตาย)
        if (GameplayHUD.instance && GameplayHUD.instance['_selectedTowerNode'] === this.node) {
            GameplayHUD.instance.hidePlacedTowerInfo();
        }
    }

    private onTowerClicked(event: EventTouch): void {
        event.propagationStopped = true; // ไม่ให้ bubbling ขึ้นไปถึง scene
        if (GameplayHUD.instance) {
            GameplayHUD.instance.showPlacedTowerInfo(this.node);
        }
    }
}
