import { _decorator, CCFloat, Component, Node, Vec3, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: CCFloat })
    speed = 0
    public target_pos: Vec3 = new Vec3()
    public dir = new Vec3();

    protected start(): void {
        const direction = this.target_pos.subtract(this.node.worldPosition).normalize();
        this.dir = direction
        const radian = Math.atan2(direction.y, direction.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, -radian);
        this.node.setWorldRotation(quat);
    }

    update(deltaTime: number) {
        let moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, this.dir, this.speed * deltaTime);
        let nextPos = new Vec3();
        Vec3.add(nextPos, this.node.worldPosition, moveStep);

        this.node.worldPosition = nextPos;
    }
}
