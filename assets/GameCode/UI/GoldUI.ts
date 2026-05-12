import { _decorator, Component, Label, director } from 'cc';
import { ResourceManager } from '../CoreSystems/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('GoldUI')
export class GoldUI extends Component {
    @property(Label)
    public goldLabel: Label = null;

    protected onLoad() {
        // ดักฟัง Event เมื่อเงินเปลี่ยน
        director.getScene().on("GOLD_CHANGED", this.updateGoldDisplay, this);
    }

    protected start() {
        // แสดงค่าเริ่มต้น
        if (ResourceManager.instance) {
            this.updateGoldDisplay(ResourceManager.instance.getGold());
        }
    }

    protected onDestroy() {
        // ยกเลิกการดักฟังเมื่อถูกทำลาย
        if (director.getScene()) {
            director.getScene().off("GOLD_CHANGED", this.updateGoldDisplay, this);
        }
    }

    private updateGoldDisplay(amount: number) {
        if (this.goldLabel) {
            this.goldLabel.string = `${amount}`;
        }
    }
}
