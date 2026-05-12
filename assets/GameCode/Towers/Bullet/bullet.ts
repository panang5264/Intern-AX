import { _decorator, CCFloat, Component, Node, Vec3, Quat, Collider2D, assert, BoxCollider2D, Contact2DType, CCInteger, CCBoolean, Sprite, Enum } from 'cc';
import { SplashArea } from './SplashArea';
import { DamageType } from '../../CoreSystems/GameConfig';
import { Enemy } from '../../Monsters/Enemy';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: CCFloat }) speed = 0
    public target: Node;
    public dir = new Vec3();
    @property({ type: Collider2D })
    public collider: Collider2D = null;
    @property(CCInteger) damage: number = 0;
    @property(CCBoolean) area_damage: boolean = false;
    @property(SplashArea) area_collider: SplashArea;
    stopMoving: boolean = false;

    @property({ type: Enum(DamageType) })
    public damageType: DamageType = DamageType.PHYSICAL;

    @property({ type: CCFloat })
    public holyBonus: number = 0;

    protected start(): void {
        const target_pos = this.target.getWorldPosition();
        const direction = target_pos.subtract(this.node.worldPosition).normalize();
        this.dir = direction
        const radian = Math.atan2(direction.y, direction.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, -radian);
        this.node.setWorldRotation(quat);

        if (this.collider === null) {
            this.collider = this.node.getComponent(BoxCollider2D) as Collider2D | null
        }
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this)
    }

    onHitEnemy(selfCollider: Collider2D, otherCollider: Collider2D) {
        const enemy = otherCollider.body.getComponent(Enemy) as Enemy | null
        if (enemy == null || otherCollider.body.node != this.target) {
            return;
        }

        if (this.area_damage) {
            assert(this.area_collider != null, "Please Specify Area")
            this.area_collider.explode(this.damage)
            this.stopMoving = true;
            this.node.getComponent(Sprite).enabled = false
            this.scheduleOnce(this.node.destroy.bind(this.node), 0.25)
        } else {
            enemy.takeDamage(this.damage)
            this.node.destroy()
        }
    }

    protected onDestroy(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this)
    }

    update(deltaTime: number) {
        if (this.stopMoving === true) {
            return;
        }
        let moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, this.dir, this.speed * deltaTime);
        let nextPos = new Vec3();
        Vec3.add(nextPos, this.node.worldPosition, moveStep);

        this.node.worldPosition = nextPos;
    }
}
