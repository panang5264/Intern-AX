import { _decorator, CCFloat, Component, Node, Vec3, Quat, Collider2D, assert, BoxCollider2D, Contact2DType, CCInteger, CCBoolean, Sprite, Enum } from 'cc';
import { SplashArea } from './SplashArea';
import { DamageType } from '../../CoreSystems/GameConfig';
import { Enemy } from '../../Monsters/Enemy';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: CCFloat }) public speed = 800;

    public target: Node = null;
    public damage: number = 0;
    public damageType: DamageType = DamageType.PHYSICAL;
    public holyBonus: number = 0;

    @property({ type: Collider2D })
    public collider: Collider2D = null;

    @property(CCBoolean) public area_damage: boolean = false;
    @property(SplashArea) public area_collider: SplashArea = null;

    private _dir = new Vec3();
    private _stopMoving: boolean = false;

    protected start(): void {
        if (!this.target || !this.target.isValid) return;

        const target_pos = new Vec3();
        this.target.getWorldPosition(target_pos);
        const my_pos = new Vec3();
        this.node.getWorldPosition(my_pos);

        this._dir = target_pos.subtract(my_pos).normalize();

        const radian = Math.atan2(this._dir.y, this._dir.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, radian);
        this.node.setWorldRotation(quat);

        if (this.collider === null) {
            this.collider = this.node.getComponent(Collider2D);
        }

        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }

    private onHitEnemy(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (this._stopMoving) return;

        // หาคอมโพเนนต์ Enemy
        const enemy = otherCollider.node.getComponent(Enemy);
        if (enemy == null || otherCollider.node != this.target) return;

        // ระบบระเบิด (Splash Damage)
        if (this.area_damage) {
            if (this.area_collider) {
                // ส่งค่า Damage, Type และ Bonus ไปให้วงระเบิด
                this.area_collider.explode(this.damage, this.damageType, this.holyBonus);
            }

            this._stopMoving = true;
            const sprite = this.node.getComponent(Sprite);
            if (sprite) sprite.enabled = false;

            this.scheduleOnce(() => { this.node.destroy(); }, 0.1);
        }
        // ระบบโจมตีเป้าหมายเดี่ยว
        else {
            enemy.takeDamage(this.damage, this.damageType, this.holyBonus);
            this.node.destroy();
        }
    }

    protected update(dt: number) {
        if (this._stopMoving || !this.target) return;

        // เคลื่อนที่ตามทิศทางที่คำนวณไว้
        const currentPos = new Vec3();
        this.node.getWorldPosition(currentPos);
        const moveStep = this._dir.clone().multiplyScalar(this.speed * dt);
        this.node.setWorldPosition(currentPos.add(moveStep));

        // ระบบสำรอง: ถ้ากระสุนหลุดระยะ หรือบินไปไกลเกินไปให้ทำลายทิ้ง
        if (Vec3.distance(currentPos, Vec3.ZERO) > 5000) {
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }
}
