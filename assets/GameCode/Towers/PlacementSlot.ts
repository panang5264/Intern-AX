import { _decorator, Component, Node, Prefab, instantiate, Sprite, Color } from 'cc';
import { TowerManager } from './TowerManager';

const { ccclass, property } = _decorator;

@ccclass('PlacementSlot')
export class PlacementSlot extends Component {
    @property({ tooltip: 'Optional: Specific tower prefab for this slot. If null, uses Manager selection.' })
    public customTowerPrefab: Prefab | null = null;

    @property({ type: Color })
    public hoverColor: Color = new Color(200, 200, 200, 150);

    private _originalColor: Color = Color.WHITE;
    private _isOccupied: boolean = false;
    private _currentTower: Node | null = null;
    private _sprite: Sprite | null = null;

    start() {
        this._sprite = this.getComponent(Sprite);
        if (this._sprite) {
            this._originalColor = this._sprite.color.clone();
        }

        // Setup Event Listeners
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onSlotClicked, this);
    }

    private onMouseEnter() {
        if (!this._isOccupied && this._sprite) {
            this._sprite.color = this.hoverColor;
        }
    }

    private onMouseLeave() {
        if (this._sprite) {
            this._sprite.color = this._originalColor;
        }
    }

    private onSlotClicked() {
        if (this._isOccupied) {
            console.log("Slot is already occupied!");
            // TODO: Open Upgrade/Sell menu
            return;
        }

        this.attemptPlaceTower();
    }

    private attemptPlaceTower() {
        // Use custom prefab if assigned, otherwise use global selection from TowerManager
        let prefabToSpawn = this.customTowerPrefab;
        
        if (!prefabToSpawn && TowerManager.instance) {
            prefabToSpawn = TowerManager.instance.selectedTowerPrefab;
        }

        if (!prefabToSpawn) {
            console.warn("No tower prefab available for placement.");
            return;
        }

        this.placeTower(prefabToSpawn);
    }

    public placeTower(prefab: Prefab) {
        this._currentTower = instantiate(prefab);
        this._currentTower.parent = this.node;
        this._currentTower.setPosition(0, 0, 0);
        
        this._isOccupied = true;
        
        // Visual feedback
        if (this._sprite) {
            // Optional: Hide the slot marker when occupied
            // this._sprite.enabled = false;
            this._sprite.color = this._originalColor;
        }
        
        console.log(`Tower placed at ${this.node.name}`);
    }

    public removeTower() {
        if (this._currentTower) {
            this._currentTower.destroy();
            this._currentTower = null;
            this._isOccupied = false;
            
            if (this._sprite) {
                this._sprite.enabled = true;
            }
        }
    }

    public get isOccupied(): boolean {
        return this._isOccupied;
    }
}
