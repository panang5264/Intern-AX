import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
import { TowerManager } from './TowerManager';
const { ccclass, property } = _decorator;

@ccclass('PlacementSlot')
export class PlacementSlot extends Component {
    @property({ type: Number, tooltip: 'จำกัดจำนวนป้อมประเภทนี้ (ใส่ 0 คือไม่จำกัด)' })
    public typeLimit: number = 0;

    @property public detectionRadius: number = 100;

    private _isOccupied: boolean = false;

    start() {

        director.getScene().on("TOWER_DROPPED", this.onTowerDropped, this);
    }


    onDestroy() {
        if (director.getScene()) {
            director.getScene().off("TOWER_DROPPED", this.onTowerDropped, this);
        }
    }

    private onTowerDropped(data: { position: Vec3, prefab: Prefab, type: string }) {
        if (this._isOccupied) return;


        const slotWorldPos = new Vec3();
        this.node.getWorldPosition(slotWorldPos);

        const dist = Vec3.distance(slotWorldPos, data.position);

        if (dist > this.detectionRadius) return;


        if (TowerManager.instance && !TowerManager.instance.canPlaceTower(data.type, this.typeLimit)) {
            return;
        }

        this.placeTower(data.prefab, data.type);
    }

    private placeTower(prefab: Prefab, type: string) {
        const tower = instantiate(prefab);
        tower.parent = this.node;
        tower.setPosition(0, 0, 0);
        this._isOccupied = true;

        if (TowerManager.instance) {
            TowerManager.instance.recordPlacement(type);
        }

        console.log(`วางป้อม ${type} ลงใน ${this.node.name} สำเร็จ!`);
    }
}
