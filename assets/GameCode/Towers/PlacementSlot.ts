// assets/GameCode/Towers/PlacementSlot.ts

import { _decorator, Component, Node, Prefab, instantiate, Vec3, director, CCFloat } from 'cc';
import { TowerManager } from './TowerManager';
import { ResourceManager } from '../Core/ResourceManager';
import { GlobalEvent } from '../Core/Constant';
const { ccclass, property } = _decorator;

@ccclass('PlacementSlot')
export class PlacementSlot extends Component {

    @property({ type: CCFloat, tooltip: 'จำกัดจำนวนป้อมประเภทนี้ (ใส่ 0 คือไม่จำกัด)' })
    public typeLimit: number = 0;


    @property({ type: CCFloat }) public detectionRadius: number = 100;


    @property({ type: CCFloat }) public snapDistance: number = 120;

    private _isOccupied: boolean = false;
    private _currentTower: Node = null;
    private _currentCost: number = 0;
    private _currentType: string = "";

    start() {
        director.getScene().on(GlobalEvent.TOWER_DROPPED, this.onTowerDropped, this);
    }

    onDestroy() {
        if (director.getScene()) {
            director.getScene().off(GlobalEvent.TOWER_DROPPED, this.onTowerDropped, this);
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
            this._currentCost = data.cost;
            this._currentType = data.type || "";
            this.placeTower(data.prefab, data.towerName, data.type);
            console.log(`[Slot] place tower ${data.towerName} success! (paid ${data.cost})`);
        } else {
            // ใช้ Event แจ้งเตือนไปยัง UI
            director.getScene().emit(GlobalEvent.SHOW_NOTI, "INSUFFICIENT FUNDS!");

            console.log(`[Slot] not enought money ${data.towerName}!`);
        }
    }

    private placeTower(prefab: Prefab, towerName: string, type?: string) {
        const tower = instantiate(prefab);
        tower.parent = this.node;
        tower.setPosition(0, 0, 0);
        this._currentTower = tower;
        this._isOccupied = true;

        if (TowerManager.instance && type) {
            TowerManager.instance.recordPlacement(type);
        }

        console.log(`place tower ${towerName} into ${this.node.name}`);
    }

    public sellTower() {
        if (!this._isOccupied || !this._currentTower) return;

        const refund = Math.floor(this._currentCost * 0.3);

        if (ResourceManager.instance) {
            ResourceManager.instance.addGold(refund);
            director.getScene().emit(GlobalEvent.SHOW_NOTI, `SOLD FOR +${refund} GOLD`);
        }

        if (TowerManager.instance && this._currentType) {
            TowerManager.instance.removeTower(this._currentType);
        }

        this._currentTower.destroy();
        this._currentTower = null;
        this._isOccupied = false;
    }
}
