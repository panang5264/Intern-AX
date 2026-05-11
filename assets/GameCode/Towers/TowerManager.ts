import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TowerManager')
export class TowerManager extends Component {
    public static instance: TowerManager = null;

    @property public maxTotalTowers: number = 10; // จำกัดจำนวนป้อมรวมทั้งด่าน
    private _currentTotalTowers: number = 0;


    private _typeCounts: Map<string, number> = new Map();

    onLoad() {
        TowerManager.instance = this;
    }


    public canPlaceTower(type: string, typeLimit: number): boolean {

        if (this._currentTotalTowers >= this.maxTotalTowers) {
            console.warn("Cant'place tower beacause max Total tower ");
            return false;
        }


        if (typeLimit > 0) {
            const currentCount = this._typeCounts.get(type) || 0;
            if (currentCount >= typeLimit) {
                console.warn(`Can't place type tower beacause limit type tower ${type}!`);
                return false;
            }
        }

        return true;
    }

    public recordPlacement(type: string) {
        this._currentTotalTowers++;
        const currentCount = this._typeCounts.get(type) || 0;
        this._typeCounts.set(type, currentCount + 1);
    }
}
