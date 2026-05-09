import { _decorator, Component, Node, Collider2D, CircleCollider2D, Contact2DType, EventTarget, GradientRange, Graphics, Color } from 'cc';
const { ccclass, property } = _decorator;

export enum DetectionType {
    Enter = "enter",
    Leave = "leave",
}

@ccclass('DetectionArea')
export class DetectionArea extends Component {
    private area: CircleCollider2D
    detected = new EventTarget()
    start() {
        console.log("detection init");
        this.area = this.node.getComponent(CircleCollider2D) as CircleCollider2D | null
        if (this.area === null || this.area === undefined) {
            throw Error("missing CircleCollider2D Componenet")
        }
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        this.area.on(Contact2DType.END_CONTACT, this.onEndContact, this)

        const g = this.node.getComponent(Graphics)
        g.circle(this.node.position.x, this.node.position.y, this.area.radius)
        g.stroke()
        g.fill()

    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        let other = otherCollider.node
        this.detected.emit(DetectionType.Enter, other)
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        let other = otherCollider.node
        this.detected.emit(DetectionType.Leave, other)
    }


    public addListener(type: DetectionType, callback: (node: Node) => void) {
        this.detected.on(type, callback)
    }

    public removeListener(type: DetectionType, callback: (node: Node) => void) {
        this.detected.off(type, callback)
    }
}
