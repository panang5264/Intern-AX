// assets/GameCode/Towers/TowerController.ts

import { _decorator, Component, Node, Prefab, instantiate, CCFloat, director, Vec3, Enum, Animation, CCBoolean, CCInteger } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { Bullet } from './Bullet/bullet';
import { DamageType, TowerType } from '../Core/GameConfig'; // Import ประเภทดาเมจ
import { BUFF_HOLY, BUFF_SPD_SCALE, BuffType } from '../Core/BuffType';
import { ResourceManager } from '../Core/ResourceManager';
import { Enemy } from '../Monsters/Enemy'; // เพิ่มการ Import Enemy
import { UpgradeStat, UpgradeType } from './TowerUpgrade';

const { ccclass, property } = _decorator;


@ccclass('TowerController')
export class TowerController extends Component {
    // --- Stats ---
    @property({ type: Enum(TowerType) }) public type = TowerType.ATTACK_TOWER;
    @property({ type: DetectionArea }) public detectionArea: DetectionArea = null;
    @property({ type: Prefab }) public bulletPrefab: Prefab = null;

    @property({ group: "General" }) public towerName: string = "Tower";
    @property({ group: "General", type: CCFloat }) public cost: number = 100;
    @property({ group: "General", type: CCFloat, visible() { return this.type === TowerType.ATTACK_TOWER || this.type === TowerType.SUPPORT; } })
    public towerRange: number = 275;

    @property({ group: "Attack Stats", visible() { return this.type === TowerType.ATTACK_TOWER }, type: CCFloat })
    public damage: number = 0;
    @property({ group: "Attack Stats", visible() { return this.type === TowerType.ATTACK_TOWER }, type: CCFloat })
    public attackCooldown: number = 1.0;

    @property({ group: "Attack Stats", visible() { return this.type === TowerType.ATTACK_TOWER }, type: Enum(DamageType) })
    public damageType: DamageType = DamageType.PHYSICAL;

    @property({ group: "Attack Stats", visible() { return this.type === TowerType.ATTACK_TOWER }, type: CCBoolean })
    public isMultipleHit: boolean = false
    @property({ group: "Attack Stats", visible() { return this.isMultipleHit }, type: CCInteger })
    public hit_number: number = 0;
    @property({ group: "Attack Stats", visible() { return this.isMultipleHit }, type: CCFloat })
    public hit_interval: number = 0.1;

    @property({ group: "Attack Stats", visible() { return this.type === TowerType.ATTACK_TOWER }, })
    public isSplash: boolean = false;
    @property({ group: "Attack Stats", type: CCFloat, visible() { return this.isSplash } })
    public splashRadius: number = 100;

    @property({ group: "Economy", visible() { return this.type === TowerType.GOLDMINE }, type: CCFloat })
    public goldGenerated: number = 0;
    @property({ group: "Economy", visible() { return this.type === TowerType.GOLDMINE }, type: CCFloat })
    public generationInterval: number = 40;

    @property({ group: "Support", visible() { return this.type === TowerType.SUPPORT }, type: Enum(BuffType) })
    buff: BuffType = BuffType.None
    buffEff: number = 0

    @property({ type: Animation, group: "Visuals" })
    public unitAnim: Animation = null;
    @property({ group: "Visuals" })
    public idleAnimName: string = "Idle";
    @property({ group: "Visuals" })
    public attackAnimName: string = "Attack";


    private _enemyList: Node[] = [];
    private _towerList: Node[] = [];
    private _buffList: Map<BuffType, number[]> = new Map();
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
            case TowerType.SUPPORT:
                if (!this.detectionArea) {
                    this.detectionArea = this.getComponentInChildren(DetectionArea);
                }
                if (this.detectionArea) {
                    this.detectionArea.setRadius(this.towerRange);
                    this.detectionArea.addListener(DetectionType.Enter, this.onEnterTowerRange.bind(this));
                    this.detectionArea.addListener(DetectionType.Leave, this.onLeaveTowerRange.bind(this));
                }

                switch (this.buff) {
                    case BuffType.HolyDmg:
                        this.buffEff = BUFF_HOLY
                    default:
                        break;
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

        // --- Attack ---
        if (this.type === TowerType.ATTACK_TOWER) {
            this._enemyList = this._enemyList.filter(enemy => enemy && enemy.isValid);
            this._attackTimer += (this._attackTimer <= this.attackCooldown) ? dt : 0;
            if (this._attackTimer >= this.attackCooldown && this._enemyList.length > 0) {
                if (this.isMultipleHit) {
                    this.schedule(this.shoot, this.hit_interval, this.hit_number - 1)
                } else {
                    this.shoot();
                }
                this._attackTimer = 0;
            }
        } else if (this.type === TowerType.SUPPORT) {
            this._towerList = this._towerList.filter(n => n && n.isValid)
        }
    }

    private shoot() {
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
            if (this.isSplash) {
                bulletComp.setSplashRadius(this.splashRadius)
            }
        }
    }

    public onEnterTowerRange(node: Node) {
        switch (this.type) {
            case TowerType.ATTACK_TOWER:
                const enemyComp = node.getComponent(Enemy);
                if (enemyComp) {
                    console.log(`[Tower] ${this.towerName} ตรวจพบศัตรู: ${node.name}`);
                    this._enemyList.push(node);
                }
                break;
            case TowerType.SUPPORT:
                const t = node.getComponent(TowerController);
                if (t && t != this) {
                    t.getBuff(this.buff, this.buffEff);
                    this._towerList.push(node);
                }
                break;
        }
    }

    public onLeaveTowerRange(node: Node) {
        switch (this.type) {
            case TowerType.ATTACK_TOWER:
                const index = this._enemyList.indexOf(node);
                if (index !== -1)
                    this._enemyList.splice(index, 1);
                break;
            case TowerType.SUPPORT:
                const towerIndex = this._towerList.indexOf(node);
                if (towerIndex !== -1) this._towerList.splice(towerIndex, 1);
                const t = node.getComponent(TowerController);
                if (t && t != this) t.removeBuff(this.buff, this.buffEff);
                break;
        }
    }

    public getBuff(buff: BuffType, effective: number) {
        const sources = this._buffList.get(buff) ?? [];
        sources.push(effective);
        this._buffList.set(buff, sources);
        this._applyBuffBest(buff, sources);
    }

    public removeBuff(buff: BuffType, effective: number) {
        const sources = this._buffList.get(buff);
        if (!sources) return;
        const idx = sources.indexOf(effective);
        if (idx !== -1) sources.splice(idx, 1);
        if (sources.length === 0) {
            this._buffList.delete(buff);
            this._resetBuff(buff);
        } else {
            this._applyBuffBest(buff, sources);
        }
    }

    private _applyBuffBest(buff: BuffType, sources: number[]) {
        switch (buff) {
            case BuffType.IncAtkSpd:
                this.attackCooldown = this._baseAttackCooldown * Math.min(...sources);
                break;
            case BuffType.HolyDmg:
                this._holyDamageBonus = Math.max(...sources);
                break;
        }
    }

    private _resetBuff(buff: BuffType) {
        switch (buff) {
            case BuffType.IncAtkSpd:
                this.attackCooldown = this._baseAttackCooldown;
                break;
            case BuffType.HolyDmg:
                this._holyDamageBonus = 0;
                break;
        }
    }

    public upgrade(upgradeStats: UpgradeStat[]): void {
        for (const stat of upgradeStats) {
            switch (stat.attr) {
                case UpgradeType.Damage:
                    this.damage = stat.upgrade_value
                    break;
                case UpgradeType.Range:
                    this.towerRange = stat.upgrade_value
                    this.detectionArea.setRadius(this.towerRange)
                    break;
                case UpgradeType.Hit:
                    this.hit_number = stat.upgrade_value
                case UpgradeType.SplashArea:
                    this.splashRadius = stat.upgrade_value
                    break;
                case UpgradeType.GoldGenerate:
                    this.goldGenerated = stat.upgrade_value;
                    break;
                case UpgradeType.BuffEffective:
                    const oldEff = this.buffEff;
                    this.buffEff = stat.upgrade_value;
                    this._towerList.forEach(node => {
                        const t = node.getComponent(TowerController);
                        if (!t) return;
                        t.removeBuff(this.buff, oldEff);
                        t.getBuff(this.buff, this.buffEff);
                    });
                    break;
            }
        }
    }
}
