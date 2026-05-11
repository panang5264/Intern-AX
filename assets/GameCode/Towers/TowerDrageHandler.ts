import { _decorator, Component, Node, Prefab, instantiate, EventTouch, Vec3, director, Color, Sprite, Camera } from 'cc';
import { TowerController } from './TowerController'; // หรือเปลี่ยนเป็นชื่อสคริปต์ที่คุณใช้คุมป้อม
const { ccclass, property } = _decorator;

@ccclass('TowerDragHandler')
export class TowerDragHandler extends Component {
    @property(Prefab) public towerPrefab: Prefab = null;
    @property(String) public towerType: string = "Archer";

    private _ghost: Node | null = null;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onDragStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onDragMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onDragEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onDragEnd, this);
    }

    private onDragStart(event: EventTouch) {
        if (!this.towerPrefab) return;
        this._ghost = instantiate(this.towerPrefab);
        this._ghost.parent = director.getScene().getChildByName("Canvas");


        const controller = this._ghost.getComponent(TowerController) || this._ghost.getComponent("AttackTower");
        if (controller) (controller as any).enabled = false;


        const sprite = this._ghost.getComponent(Sprite) || this._ghost.getComponentInChildren(Sprite);
        if (sprite) sprite.color = new Color(255, 255, 255, 150);
    }

    private onDragMove(event: EventTouch) {
        if (!this._ghost) return;


        const touchPos = event.getUILocation();

        this._ghost.setWorldPosition(new Vec3(touchPos.x, touchPos.y, 0));
    }

    private onDragEnd(event: EventTouch) {
        if (!this._ghost) return;


        const dropWorldPos = new Vec3();
        this._ghost.getWorldPosition(dropWorldPos);


        director.getScene().emit("TOWER_DROPPED", {
            position: dropWorldPos,
            prefab: this.towerPrefab,
            type: this.towerType
        });

        this._ghost.destroy();
        this._ghost = null;
    }
}
