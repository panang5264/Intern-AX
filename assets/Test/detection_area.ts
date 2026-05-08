import { _decorator, Component, Node, Collider2D, CircleCollider2D, Contact2DType, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

export enum DetectionType {
    Enter = "enemy_enter",
    Leave = "enemy_leave"
}

@ccclass('DetectionArea')
export class DetectionArea extends Component {
    private area: CircleCollider2D
    enemyDetected = new EventTarget()
    start() {
        console.log("detection init");
        this.area = this.node.getComponent(CircleCollider2D) as CircleCollider2D | null
        if (this.area === null || this.area === undefined) {
            throw Error("missing CircleCollider2D Componenet")
        }
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        this.area.on(Contact2DType.END_CONTACT, this.onEndContact, this)
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        let other = otherCollider.node
        this.enemyDetected.emit(DetectionType.Enter, other)
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        let other = otherCollider.node
        this.enemyDetected.emit(DetectionType.Leave, other)
    }


    public addListener(type: DetectionType, callback: (node: Node) => void) {
        this.enemyDetected.on(type, callback)
    }

    public removeListener(type: DetectionType, callback: (node: Node) => void) {
        this.enemyDetected.off(type, callback)
    }
}
