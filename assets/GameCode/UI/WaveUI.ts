// assets/GameCode/UI/WaveUI.ts
import { _decorator, Component, Label, director, Color, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WaveUI')
export class WaveUI extends Component {
    @property(Label) waveLabel: Label = null; // Label อันบน
    @property(Label) incomeLabel: Label = null; // Label อันล่าง
    @property(Node) skipButton: Node = null; // ปุ่ม Skip

    private _restTimer: number = 0;
    private _isCountingDown: boolean = false;
    private _nextWaveNum: number = 1;

    protected start() {
        director.getScene().on("WAVE_STARTED", this.onWaveStarted, this);
        director.getScene().on("WAVE_RESTING", this.onWaveResting, this);
        director.getScene().on("ENABLE_SKIP", (show: boolean) => {
            if (this.skipButton) this.skipButton.active = show;
        }, this);

        // เริ่มต้นเกมมา ให้ซ่อนข้อความล่างและปุ่มข้ามไว้ก่อน
        if (this.incomeLabel) this.incomeLabel.string = "";
        if (this.skipButton) this.skipButton.active = false;
    }

    update(dt: number) {
        if (this._isCountingDown && this._restTimer > 0) {
            this._restTimer -= dt;
            const remaining = Math.ceil(this._restTimer);

            if (this.incomeLabel) {
                // ถ้าเหลือเวลา 5 วินาทีสุดท้าย ให้แสดงเป็นตัวเลขถอยหลังตัวใหญ่ๆ (นับถอยหลังเริ่มเกม)
                if (remaining <= 5) {
                    this.incomeLabel.color = Color.RED;
                    
                    if (this._nextWaveNum === 1) {
                        this.incomeLabel.string = `GAME START IN: ${remaining}`;
                    } else {
                        this.incomeLabel.string = `NEXT WAVE IN: ${remaining}`;
                    }
                } else {
                    // ช่วงที่ยังเหลือเวลามากกว่า 5 วิ ให้โชว์คำว่า Preparing หรือโชว์ยอดเงินค้างไว้
                    this.incomeLabel.color = Color.WHITE;
                }
            }

            if (this._restTimer <= 0) {
                this._isCountingDown = false;
                if (this.incomeLabel) this.incomeLabel.string = ""; // เริ่มเวฟแล้วให้หายไป
            }
        }
    }

    private onWaveStarted(data: any) {
        this._isCountingDown = false;
        if (this.skipButton) this.skipButton.active = false;

        // แสดง Wave ปัจจุบันที่ด้านบน
        if (this.waveLabel) {
            this.waveLabel.string = `Wave: ${data.currentWave}/${data.totalWaves}`;
        }

        // เคลียร์ข้อความด้านล่าง (ไม่ต้องบอก Next Income ตามที่ต้องการ)
        if (this.incomeLabel) {
            this.incomeLabel.string = "";
        }
    }

    private onWaveResting(data: any) {
        this._restTimer = data.duration;
        this._isCountingDown = true;
        this._nextWaveNum = data.nextWave;
        if (this._nextWaveNum === 1) {
            // Wave 1 ครั้งแรก
            if (this.waveLabel) {
                // แสดงทั้งเลขเวฟและข้อความ
                this.waveLabel.string = `Wave: 1/${data.totalWaves} - GET READY!`;
            }
            if (this.incomeLabel) {
                this.incomeLabel.color = Color.WHITE;
                this.incomeLabel.string = "PREPARING FOR BATTLE";
            }
        } else {
            // จบเวฟอื่นๆ
            if (this.waveLabel) {
                // แสดง Wave ปัจจุบันที่เพิ่งจบไปควบคู่กับ Clear!
                this.waveLabel.string = `Wave: ${this._nextWaveNum - 1}/${data.totalWaves} CLEAR!`;
            }
            if (this.incomeLabel) {
                this.incomeLabel.color = Color.YELLOW;
                this.incomeLabel.string = `REWARD: +${data.reward} GOLD`;
            }
        }
    }
}