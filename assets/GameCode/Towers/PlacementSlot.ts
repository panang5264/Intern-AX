// assets/GameCode/Towers/PlacementSlot.ts

import { _decorator, Component, Node, Prefab, instantiate, Vec3, director, CCFloat } from 'cc';
import { TowerManager } from './TowerManager';
import { ResourceManager } from '../CoreSystems/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('PlacementSlot')
export class PlacementSlot extends Component {

    @property({ type: CCFloat, tooltip: 'จำกัดจำนวนป้อมประเภทนี้ (ใส่ 0 คือไม่จำกัด)' })
    public typeLimit: number = 0;


    @property({ type: CCFloat }) public detectionRadius: number = 100;


    @property({ type: CCFloat }) public snapDistance: number = 120;

    private _isOccupied: boolean = false;

    start() {
        director.getScene().on("TOWER_DROPPED", this.onTowerDropped, this);
    }

    onDestroy() {
        if (director.getScene()) {
            director.getScene().off("TOWER_DROPPED", this.onTowerDropped, this);
        }
    }

    private onTowerDropped(data: { prefab: Prefab, worldPosition: Vec3, towerName: string, cost: number, type?: string }) {
        if (this._isOccupied) return;


        const slotWorldPos = new Vec3();
        this.node.getWorldPosition(slotWorldPos);
        const dist = Vec3.distance(slotWorldPos, data.worldPosition);

        if (dist > this.detectionRadius) return;


        if (TowerManager.instance && data.type && !TowerManager.instance.canPlaceTower(data.type, this.typeLimit)) {
            console.log(`[Slot] cannot place ${data.towerName} (over limit)`);
            return;
        }

        if (ResourceManager.instance && ResourceManager.instance.getGold() >= data.cost) {
            ResourceManager.instance.spendGold(data.cost);
            this.placeTower(data.prefab, data.towerName, data.type);
            console.log(`[Slot] place tower ${data.towerName} success! (paid ${data.cost})`);
        } else {
            console.log(`[Slot] not enought money ${data.towerName}!`);
        }
    }

    private placeTower(prefab: Prefab, towerName: string, type?: string) {
        const tower = instantiate(prefab);
        tower.parent = this.node;
        tower.setPosition(0, 0, 0);
        this._isOccupied = true;

        if (TowerManager.instance && type) {
            TowerManager.instance.recordPlacement(type);
        }

        console.log(`place tower ${towerName} into ${this.node.name}`);
    }
}
