import { _decorator, Component, Node, Collider2D, CircleCollider2D, Contact2DType, EventTarget, Graphics } from 'cc';
const { ccclass, property } = _decorator;

export enum DetectionType {
    Enter = "enter",
    Leave = "leave",
}

@ccclass('DetectionArea')
export class DetectionArea extends Component {
    private area: CircleCollider2D | null = null;
    detected = new EventTarget();

    onLoad() {
        this.area = this.getComponent(CircleCollider2D);
        if (!this.area) {
            throw new Error("Missing CircleCollider2D Component");
        }
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.area.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    start() {
        // วาดวงกลมแสดงรัศมีตรวจจับ
        const g = this.getComponent(Graphics);
        if (g && this.area) {
            g.circle(this.node.position.x, this.node.position.y, this.area.radius);
            g.stroke();
            g.fill();
        }
    }

    protected onBeginContact(self: Collider2D, other: Collider2D) {
        // ใน Cocos Creator 3.x ค่า group อยู่ที่ Collider ไม่ใช่ Node
        console.log(`[Detection] ป้อมเจอวัตถุ: ${other.node.name} (Group Index: ${other.group})`);
        this.detected.emit(DetectionType.Enter, other.node);
    }

    protected onEndContact(self: Collider2D, other: Collider2D) {
        this.detected.emit(DetectionType.Leave, other.node);
    }

    public addListener(type: DetectionType, callback: (node: Node) => void) {
        this.detected.on(type, callback);
    }

    public removeListener(type: DetectionType, callback: (node: Node) => void) {
        this.detected.off(type, callback);
    }

    public setRadius(radius: number): void {
        if (this.area) {
            this.area.radius = radius;
            this.area.apply(); // สำคัญ: อัปเดตค่าในระบบฟิสิกส์
        }
    }

    public getRadius(): number {
        return this.area ? this.area.radius : 0;
    }
}
