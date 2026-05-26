import { _decorator, CCFloat, Component, Node, Vec3, Quat, Collider2D, Contact2DType, CCBoolean, Sprite } from 'cc';
import { DamageType } from '../../Core/GameConfig';
import { Enemy } from '../../Monsters/Enemy';
import { SplashArea } from './SplashArea';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: CCFloat }) public speed = 1000;
    @property({ type: CCFloat }) public hitRadius = 30;

    public target: Node = null;
    public damage: number = 0;
    public damageType: DamageType = DamageType.PHYSICAL;
    public holyBonus: number = 0;

    private _dir = new Vec3();
    private _stopMoving: boolean = false;
    private _collider: Collider2D = null;

    @property(CCBoolean) public area_damage: boolean = false;
    @property(SplashArea) public area_collider: SplashArea = null;

    protected onLoad() {
        this._collider = this.getComponent(Collider2D);
        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }

    protected start(): void {
        if (!this.target || !this.target.isValid) return;

        const target_pos = new Vec3();
        this.target.getWorldPosition(target_pos);
        const my_pos = new Vec3();
        this.node.getWorldPosition(my_pos);

        this._dir = target_pos.subtract(my_pos).normalize();
        const radian = Math.atan2(this._dir.y, this._dir.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, -radian);

        this.node.setWorldRotation(quat);
        if (this._collider === null) {
            this._collider = this.node.getComponent(Collider2D);
        }

        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }

    protected update(dt: number) {
        if (this._stopMoving) return;
        if (!this.target || !this.target.isValid) {
            this.node.destroy();
            return;
        }

        const targetPos = new Vec3();
        this.target.getWorldPosition(targetPos);
        const myPos = new Vec3();
        this.node.getWorldPosition(myPos);

        this._dir = targetPos.subtract(myPos).normalize();

        const radian = Math.atan2(this._dir.y, this._dir.x);
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, -radian);
        this.node.setWorldRotation(quat);

        const moveStep = this._dir.multiplyScalar(this.speed * dt);
        this.node.setWorldPosition(myPos.add(moveStep));
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
        } else {
            enemy.takeDamage(this.damage, this.damageType, this.holyBonus);
            this.node.destroy();
        }
    }

    protected onDestroy() {
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }

    public setSplashRadius(radius: number) {
        this.area_collider.setSplashRadius(radius)
    }
}
