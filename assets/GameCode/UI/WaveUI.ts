// assets/GameCode/UI/WaveUI.ts
import { _decorator, Component, Label, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WaveUI')
export class WaveUI extends Component {
    @property(Label) waveLabel: Label = null;
    @property(Label) incomeLabel: Label = null;

    protected start() {
        director.getScene().on("WAVE_STARTED", this.onWaveStarted, this);
    }

    private onWaveStarted(data: any) {
        if (this.waveLabel) {
            this.waveLabel.string = `Wave: ${data.currentWave}/${data.totalWaves}`;
        }
        if (this.incomeLabel) {
            this.incomeLabel.string = `Next Income: +${data.income}`;
        }
    }
}
