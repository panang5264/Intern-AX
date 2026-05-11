import { _decorator, Component, assert, CircleCollider2D, Collider2D, Contact2DType, Graphics, IPhysics2DContact, Vec2 } from 'cc';
import { Enemy } from '../GameCode/Monsters/Enemy';
const { ccclass, property } = _decorator;

@ccclass("SplashArea")
export class SplashArea extends Component {
    @property(CircleCollider2D) area: CircleCollider2D
    @property(Graphics) graphics: Graphics = null
    damage: number = 0;

    protected start(): void {
        if (this.area == null) {
            this.area = this.node.getComponent(CircleCollider2D);
            assert(this.area != null, "Can't find Collider2D");
        }
        if (this.graphics == null) {
            this.graphics = this.node.getComponent(Graphics);
            assert(this.graphics != null, "Can't find Graphics");
        }
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
    }

    onHitEnemy(selfCollider: Collider2D, otherCollider: CircleCollider2D) {
        const enemy = otherCollider.body.getComponent(Enemy) as Enemy | null
        if (enemy === null) return;

        enemy.takeDamage(this.damage)
    }

    public explode(damage: number) {
        this.damage = damage;
        this.area.enabled = true;
        this.graphics.circle(this.node.position.x, this.node.position.y, this.area.radius)
        this.graphics.stroke()
        this.graphics.fill()
    }
}
