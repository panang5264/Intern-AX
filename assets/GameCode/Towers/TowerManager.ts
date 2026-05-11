import { _decorator, Component, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TowerManager')
export class TowerManager extends Component {
    private static _instance: TowerManager | null = null;

    public static get instance() {
        return this._instance;
    }

    @property(Prefab)
    public defaultTowerPrefab: Prefab | null = null;

    private _selectedTowerPrefab: Prefab | null = null;

    onLoad() {
        if (TowerManager._instance) {
            this.node.destroy();
            return;
        }
        TowerManager._instance = this;
        
        // Default selection
        this._selectedTowerPrefab = this.defaultTowerPrefab;
    }

    public get selectedTowerPrefab(): Prefab | null {
        return this._selectedTowerPrefab;
    }

    public selectTower(prefab: Prefab) {
        this._selectedTowerPrefab = prefab;
        console.log("Selected new tower type");
    }
}
