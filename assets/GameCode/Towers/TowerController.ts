// assets/GameCode/Towers/TowerController.ts

import { _decorator, Component, Node, Prefab, instantiate, CCFloat, director, Vec3, Enum, Animation } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { Bullet } from './Bullet/bullet';
import { DamageType, TowerType } from '../Core/GameConfig'; // Import ประเภทดาเมจ
import { BUFF_HOLY, BUFF_SPD_SCALE, BuffType } from '../Core/BuffType';
import { ResourceManager } from '../Core/ResourceManager';
import { Enemy } from '../Monsters/Enemy'; // เพิ่มการ Import Enemy

const { ccclass, property } = _decorator;


@ccclass('TowerController')
export class TowerController extends Component {
    // --- Stats ---
    @property({ group: "General" }) public towerName: string = "Tower";
    @property({ group: "General", type: CCFloat }) public cost: number = 100;

    @property({ group: "Attack Stats", type: CCFloat }) public damage: number = 0;
    @property({ group: "Attack Stats", type: CCFloat }) public attackCooldown: number = 1.0;

    @property({ group: "Attack Stats", type: Enum(DamageType) })
    public damageType: DamageType = DamageType.PHYSICAL;

    @property({ group: "Attack Stats" }) public isSplash: boolean = false;
    @property({ group: "Attack Stats", type: CCFloat, visible() { return this.isSplash; } })
    public splashRadius: number = 100;
    @property({ group: "Attack Stats", type: CCFloat })
    public attackRange: number = 275;

    @property({ group: "Economy", type: CCFloat }) public goldGenerated: number = 0;
    @property({ group: "Economy", type: CCFloat }) public generationInterval: number = 40;

    @property({ type: DetectionArea }) public detectionArea: DetectionArea = null;
    @property({ type: Prefab }) public bulletPrefab: Prefab = null;
    @property({ type: Enum(TowerType) }) public type = TowerType.ATTACK_TOWER;

    @property({ type: Animation, group: "Visuals" }) 
    public unitAnim: Animation = null;
    @property({ group: "Visuals" })
    public idleAnimName: string = "Idle";
    @property({ group: "Visuals" })
    public attackAnimName: string = "Attack";

    private _enemyList: Node[] = [];
    private _attackTimer: number = 0;
    private _baseAttackCooldown: number = 1.0;
    private _holyDamageBonus: number = 0;
    private _generatedGoldBound: () => void

    protected start() {
        this._baseAttackCooldown = this.attackCooldown;

        if (this.unitAnim && this.idleAnimName) {
            this.unitAnim.play(this.idleAnimName);
        }

        switch (this.type) {
            case TowerType.ATTACK_TOWER:
                if (!this.detectionArea) {
                    this.detectionArea = this.getComponentInChildren(DetectionArea);
                }
                if (this.detectionArea) {
                    this.detectionArea.setRadius(this.attackRange);
                    this.detectionArea.addListener(DetectionType.Enter, this.onEnemyEnter.bind(this));
                    this.detectionArea.addListener(DetectionType.Leave, this.onEnemyLeave.bind(this));
                }
                break;
            case TowerType.GOLDMINE:
                this._generatedGoldBound = this.generatedGold.bind(this)
                this.schedule(this._generatedGoldBound, this.generationInterval)
                break;
        }
    }

    generatedGold() {
        console.log(`[Economy] ${this.towerName} ผลิตเงิน +${this.goldGenerated} Gold!`);

        if (ResourceManager.instance) {
            ResourceManager.instance.addGold(this.goldGenerated);
        }
    }

    protected update(dt: number) {
        this._enemyList = this._enemyList.filter(enemy => enemy && enemy.isValid);

        // --- Attack ---
        if (this.damage > 0 && this._enemyList.length > 0) {
            this._attackTimer += dt;
            if (this._attackTimer >= this.attackCooldown) {
                this.shoot();
                this._attackTimer = 0;
            }
        } else if (this._enemyList.length > 0 && this.damage <= 0) {
            // แจ้งเตือนถ้ามีศัตรูแต่ดาเมจเป็น 0
            console.warn(`[Tower] ${this.towerName} มีศัตรูในระยะแต่ Damage เป็น 0!`);
        }
    }

    private shoot() {
        if (this._enemyList.length === 0) return;
        const target = this._enemyList[0];

        if (!target || !target.isValid) return;
        if (!this.bulletPrefab) {
            console.error(`[Tower] ${this.towerName} ลืมใส่ Bullet Prefab!`);
            return;
        }

        console.log(`[Tower] ${this.towerName} กำลังยิง -> ${target.name}`);

        if (this.unitAnim && this.attackAnimName) {
            this.unitAnim.play(this.attackAnimName);
            this.unitAnim.once(Animation.EventType.FINISHED, () => {
                if (this.unitAnim && this.idleAnimName) {
                    this.unitAnim.play(this.idleAnimName);
                }
            }, this);
        }

        const bulletNode = instantiate(this.bulletPrefab);
        const canvas = director.getScene().getChildByName("Canvas");
        bulletNode.parent = canvas ? canvas : this.node.parent;

        const myPos = new Vec3();
        this.node.getWorldPosition(myPos);
        bulletNode.setWorldPosition(myPos);

        const bulletComp = bulletNode.getComponent(Bullet) as Bullet | null;
        if (bulletComp) {
            bulletComp.target = target;
            bulletComp.damage = this.damage;
            bulletComp.damageType = this.damageType;
            bulletComp.holyBonus = this._holyDamageBonus;
        }
    }

    public onEnemyEnter(enemy: Node) {
        // เช็คว่าโหนดที่เข้ามาคือศัตรูจริงหรือไม่ (ต้องมีคอมโพเนนต์ Enemy)
        const enemyComp = enemy.getComponent(Enemy);
        if (enemyComp) {
            if (this._enemyList.indexOf(enemy) === -1) {
                console.log(`[Tower] ${this.towerName} ตรวจพบศัตรู: ${enemy.name}`);
                this._enemyList.push(enemy);
            }
        }
    }

    public onEnemyLeave(enemy: Node) {
        const index = this._enemyList.indexOf(enemy);
        if (index !== -1)
            this._enemyList.splice(index, 1);
    }

    public getBuff(buff: BuffType) {
        switch (buff) {
            case BuffType.IncAtkSpd:
                this.attackCooldown = this._baseAttackCooldown * BUFF_SPD_SCALE;
                break;

            case BuffType.HolyDmg:
                this._holyDamageBonus = BUFF_HOLY
                break;
        }
    }

    public removeBuff(buff: BuffType) {
        switch (buff) {
            case BuffType.IncAtkSpd:
                this.attackCooldown = this._baseAttackCooldown;
                break;

            case BuffType.HolyDmg:
                this._holyDamageBonus = 0
                break;
        }
    }
}
