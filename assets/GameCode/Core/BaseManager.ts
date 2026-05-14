// assets/GameCode/CoreSystems/BaseManager.ts

import { _decorator, assert, CCInteger, Component, Label } from 'cc';
import { Enemy } from '../Monsters/Enemy';

const { ccclass, property } = _decorator;

@ccclass('BaseManager')
export class BaseManager extends Component {
    private static _instance: BaseManager;
    public static get instance(): BaseManager {
        return this._instance;
    }

    @property(Label) hpLabel: Label = null;

    @property(CCInteger) private maxHp: number = 20;
    private currentHp: number = 20;

    onLoad() {
        BaseManager._instance = this;
        this.currentHp = this.maxHp;
        this.updateUI();
    }

    public onEnemyLeak(enemy: Enemy) {
        const damage = Math.ceil(enemy.currentHp);
        this.takeDamage(damage);

        console.log(`[Base] Monster Leak ${damage} (Base ${this.currentHp})`);
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
        // TODO: เรียก SceneManager หรือ GameOver UI
    }
}
