// assets/GameCode/Towers/Bullet/bullet.ts

import { _decorator, CCFloat, Component, Node, Vec3, Quat, Collider2D, Contact2DType } from 'cc';
import { DamageType } from '../../CoreSystems/GameConfig';
import { Enemy } from '../../Monsters/Enemy';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: CCFloat }) public speed = 1000;
    @property({ type: CCFloat }) public hitRadius = 30;

    // เพิ่มตัวแปรนี้กลับมาเพื่อปรับให้มัน "ตั้ง" หรือ "นอน"
    @property({ type: CCFloat, tooltip: "ลองใส่ -90 หรือ 90 เพื่อให้กระสุนหันหัวให้ตรง" })
    public rotationOffset = -90;

    public target: Node = null;
    public damage: number = 0;
    public damageType: DamageType = DamageType.PHYSICAL;
    public holyBonus: number = 0;

    private _dir = new Vec3();
    private _stopMoving: boolean = false;
    private _collider: Collider2D = null;

    protected onLoad() {
        this._collider = this.getComponent(Collider2D);
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

        // 1. คำนวณทิศทาง (Homing)
        this._dir = targetPos.subtract(myPos).normalize();

        // 2. หมุนหัวกระสุนให้หันไปหาศัตรู
        const radian = Math.atan2(this._dir.y, this._dir.x);
        const degree = radian * (180 / Math.PI);
        const quat = new Quat();
        // ใช้ rotationOffset เข้ามาช่วยปรับทิศทาง
        Quat.fromAxisAngle(quat, Vec3.FORWARD, (degree + this.rotationOffset) * (Math.PI / 180));
        this.node.setWorldRotation(quat);

        // 3. เคลื่อนที่
        const moveStep = this._dir.clone().multiplyScalar(this.speed * dt);
        this.node.setWorldPosition(myPos.add(moveStep));

        if (Vec3.distance(myPos, targetPos) < this.hitRadius) {
            const enemy = this.target.getComponent(Enemy);
            if (enemy) this.executeHit(enemy);
        }
    }

    private onHitEnemy(self: Collider2D, other: Collider2D) {
        if (this._stopMoving) return;
        const enemy = other.node.getComponent(Enemy);
        if (enemy) this.executeHit(enemy);
    }

    private executeHit(enemy: Enemy) {
        if (this._stopMoving) return;
        this._stopMoving = true;
        enemy.takeDamage(this.damage, this.damageType, this.holyBonus);
        this.node.destroy();
    }

    protected onDestroy() {
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
        }
    }
}
