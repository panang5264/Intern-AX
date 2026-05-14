import { _decorator, Component, Label, director, tween, v3 } from 'cc';
import { ResourceManager } from '../Core/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('GoldUI')
export class GoldUI extends Component {
    @property(Label)
    public goldLabel: Label = null;

    @property
    public animDuration: number = 0.5; // ระยะเวลาที่เลขวิ่ง (วินาที)

    private _displayGold: number = 0; // ค่าเงินที่กำลังโชว์อยู่ (ตัวเลขจะวิ่งตัวนี้)
    private _targetGold: number = 0;  // ค่าเงินจริงๆ ที่ควรจะเป็น

    protected onLoad() {
        director.getScene().on("GOLD_CHANGED", this.onGoldChanged, this);
    }

    protected start() {
        if (ResourceManager.instance) {
            const initialGold = ResourceManager.instance.getGold();
            this._targetGold = initialGold;
            this._displayGold = initialGold;
            this.updateLabel(initialGold);
        }
    }

    protected onDestroy() {
        if (director.getScene()) {
            director.getScene().off("GOLD_CHANGED", this.onGoldChanged, this);
        }
    }

    private onGoldChanged(newAmount: number) {
        // ถ้ายอดเงินใหม่มากกว่ายอดเก่า (ได้เงินเพิ่ม) ให้ทำ Animation ขยายขนาดด้วย
        if (newAmount > this._targetGold) {
            this.playBounceEffect();
        }

        this._targetGold = newAmount;

        // ใช้ Tween ทำให้ _displayGold วิ่งไปยัง _targetGold
        tween(this as any)
            .to(this.animDuration, { _displayGold: newAmount }, {
                onUpdate: () => {
                    // ทุกครั้งที่เลขเปลี่ยน ให้ปัดเศษและโชว์
                    this.updateLabel(Math.floor(this._displayGold));
                },
                easing: 'quadOut' // เริ่มวิ่งเร็วและค่อยๆ ช้าลงตอนใกล้ถึง
            })
            .start();
    }

    private updateLabel(amount: number) {
        if (this.goldLabel) {
            this.goldLabel.string = `${amount}`;
        }
    }

    // เอฟเฟกต์เด้งเล็กน้อยเวลาได้เงิน
    private playBounceEffect() {
        if (!this.goldLabel) return;

        // ขยาย Node ของ Label ขึ้น 1.2 เท่าแล้วหดกลับ
        tween(this.goldLabel.node)
            .to(0.1, { scale: v3(1.2, 1.2, 1) })
            .to(0.1, { scale: v3(1, 1, 1) })
            .start();
    }
}
