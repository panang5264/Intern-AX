import { _decorator, Component, Node, Collider2D, log, CircleCollider2D, Contact2DType, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('detection_area')
export class detection_area extends Component {
    private area: CircleCollider2D
    private eventTarget = new EventTarget()
    start() {
        console.log("detection init");
        this.area = this.node.getComponent(CircleCollider2D) as CircleCollider2D | null
        if (this.area === null) {
            throw Error("missing CircleCollider2D Componenet")
        }
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onBegineContact, this)
    }

    protected onBegineContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log("Enemy Enter")
    }


    public addListener(callback: (node: Node) => void) {
        this.eventTarget.on('enemy_enter', callback, this)
    }

    public removeListener(callback: (node: Node) => void) {
        this.eventTarget.off('enemy_enter', callback, this)
    }
}
