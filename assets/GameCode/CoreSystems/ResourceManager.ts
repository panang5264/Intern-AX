import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    public static instance: ResourceManager = null;

    @property
    public initialGold: number = 350;

    private _currentGold: number = 0;

    onLoad() {
        if (ResourceManager.instance === null) {
            ResourceManager.instance = this;
        }
        this._currentGold = this.initialGold;
    }


    public getGold(): number {
        return this._currentGold;
    }


    public addGold(amount: number) {
        if (amount <= 0) return;

        this._currentGold += amount;
        console.log(`[Resource] Get money+${amount} | have: ${this._currentGold}`);


        director.getScene().emit("GOLD_CHANGED", this._currentGold);
    }


    public spendGold(amount: number): boolean {
        if (amount > this._currentGold) {
            console.log(`[Resource] money not enough! ${amount - this._currentGold}`);
            return false;
        }

        this._currentGold -= amount;
        console.log(`[Resource] paid -${amount} | have: ${this._currentGold}`);


        director.getScene().emit("GOLD_CHANGED", this._currentGold);
        return true;
    }
}
