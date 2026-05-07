import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseManager')
export class BaseManager extends Component {
    private static _instance: BaseManager;
    public static get instance(): BaseManager {
        return this._instance;
    }
    @property(Label) hpLabel: Label = null;

    private maxHp: number = 20;
    private currentHp: number = 20;

    onLoad() {
        BaseManager._instance = this;
        this.currentHp = this.maxHp;
        this.updateUI();
    }
    public takeDamage(amount: number) {
        this.currentHp -= amount;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.onGameOver();
        }
        this.updateUI();
    }
    private updateUI() {
        if (this.hpLabel) {
            this.hpLabel.string = `HP: ${this.currentHp}`;
        }
    }
    private onGameOver() {
        console.log("Game Over!");
    }
}