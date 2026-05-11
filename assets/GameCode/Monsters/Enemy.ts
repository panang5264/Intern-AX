import { _decorator, assert, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property maxHp: number = 0;
    currentHp: number = -1;
    @property(Label) hpText: Label = null;

    protected start(): void {
        this.currentHp = this.maxHp;
        assert(this.hpText !== null, `Didn't set hp Text for ${this.node.name}`)
        this.updateHPText()
    }

    public takeDamage(damage: number) {
        this.currentHp -= damage;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.node.destroy()
            return;
        }
        this.updateHPText()
    }

    updateHPText() {
        this.hpText.string = `${this.currentHp}/${this.maxHp}`
    }
}

