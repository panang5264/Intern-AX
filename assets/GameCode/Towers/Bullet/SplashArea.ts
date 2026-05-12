import { _decorator, Component, assert, CircleCollider2D, Collider2D, Contact2DType, Graphics } from 'cc';
import { Enemy } from '../../Monsters/Enemy';
import { DamageType } from '../../CoreSystems/GameConfig'; // Import มาใช้

const { ccclass, property } = _decorator;

@ccclass("SplashArea")
export class SplashArea extends Component {
    @property(CircleCollider2D) area: CircleCollider2D = null;
    @property(Graphics) graphics: Graphics = null;

    private _damage: number = 0;
    private _damageType: DamageType = DamageType.PHYSICAL;
    private _holyBonus: number = 0;

    protected start(): void {
        if (this.area == null) {
            this.area = this.node.getComponent(CircleCollider2D);
            assert(this.area != null, "Can't find Collider2D");
        }
        if (this.graphics == null) {
            this.graphics = this.node.getComponent(Graphics);
            assert(this.graphics != null, "Can't find Graphics");
        }

        // ดักจับศัตรูที่อยู่ในวงระเบิด
        this.area.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
    }

    private onHitEnemy(selfCollider: Collider2D, otherCollider: Collider2D) {
        // หาคอมโพเนนต์ Enemy
        const enemy = otherCollider.node.getComponent(Enemy);
        if (enemy === null) return;

        // --- แก้ไข: ส่งดาเมจพร้อมประเภท และโบนัส Holy ---
        enemy.takeDamage(this._damage, this._damageType, this._holyBonus);
    }

    /**
     * สั่งให้ระเบิดทำงาน
     */
    public explode(damage: number, type: DamageType, holyBonus: number = 0) {
        this._damage = damage;
        this._damageType = type;
        this._holyBonus = holyBonus;

        // เปิดใช้งาน Collider เพื่อเช็คการชนในเฟรมนี้
        this.area.enabled = true;

        // วาดวงระเบิดโชว์ (ถ้ามี Graphics)
        if (this.graphics) {
            this.graphics.clear();
            this.graphics.circle(0, 0, this.area.radius);
            this.graphics.stroke();
            this.graphics.fill();
        }

        // ปิด Collider ในเฟรมถัดไป เพื่อไม่ให้ระเบิดซ้ำซ้อน
        this.scheduleOnce(() => {
            if (this.area) this.area.enabled = false;
            if (this.graphics) this.graphics.clear();
        }, 0.1);
    }
}
