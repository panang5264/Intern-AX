// assets/GameCode/Towers/TowerController.ts

import { _decorator, Component, Node, Prefab, instantiate, CCFloat, director, Vec3, Enum } from 'cc';
import { DetectionArea, DetectionType } from './detection_area';
import { Bullet } from './Bullet/bullet';
import { DamageType } from '../CoreSystems/GameConfig';
import { BuffType } from '../../BuffType';
import { ResourceManager } from '../CoreSystems/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('TowerController')
export class TowerController extends Component {
    // --- Stats ---
    @property({ group: "General" }) public towerName: string = "Tower";
    @property({ group: "General", type: CCFloat }) public cost: number = 100;

    @property({ group: "Attack Stats", type: CCFloat }) public damage: number = 100;
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

    private _enemyList: Node[] = [];
    private _attackTimer: number = 0;
    private _economyTimer: number = 0;
    private _baseAttackCooldown: number = 1.0;
    private _holyDamageBonus: number = 0;

    protected start() {
        this._baseAttackCooldown = this.attackCooldown;
        if (!this.detectionArea) this.detectionArea = this.getComponentInChildren(DetectionArea);
        if (this.detectionArea) {
            this.detectionArea.setRadius(this.attackRange);
            this.detectionArea.addListener(DetectionType.Enter, this.onEnemyEnter.bind(this));
            this.detectionArea.addListener(DetectionType.Leave, this.onEnemyLeave.bind(this));
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
        }

        // --- Economy ---
        if (this.goldGenerated > 0) {
            this._economyTimer += dt;
            if (this._economyTimer >= this.generationInterval) {
                console.log(`[Economy] ${this.towerName} ผลิตเงิน +${this.goldGenerated} Gold!`);


                if (ResourceManager.instance) {
                    ResourceManager.instance.addGold(this.goldGenerated);
                }

                this._economyTimer = 0;
            }
        }
    }

    private shoot() {
        const target = this._enemyList[0];
        if (!target || !this.bulletPrefab) return;

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
        if (enemy && this._enemyList.indexOf(enemy) === -1)
            this._enemyList.push(enemy);
    }

    public onEnemyLeave(enemy: Node) {
        const index = this._enemyList.indexOf(enemy);
        if (index !== -1)
            this._enemyList.splice(index, 1);
    }

    public getBuff(buff: BuffType) {
        this.attackCooldown = this._baseAttackCooldown * 0.8;
        this._holyDamageBonus = 0.1; // Priest Buff: Holy +10%
    }

    public removeBuff(buff: BuffType) {
        this.attackCooldown = this._baseAttackCooldown;
        this._holyDamageBonus = 0;
    }
}
