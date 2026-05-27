// assets/GameCode/Monsters/Enemy.ts

import { _decorator, assert, Component, Label, Enum, CCFloat, director } from 'cc';
import { EnemyType, DamageType, WeaknessTable } from '../Core/GameConfig';
import { ResourceManager } from '../Core/ResourceManager';
import { GlobalEvent } from '../Core/Constant';

const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    // --- HP System ---
    @property({ type: CCFloat })
    public maxHp: number = 100;
    public currentHp: number = -1;

    @property(Label)
    public hpText: Label = null;

    // --- Enemy Type ---
    @property({ type: Enum(EnemyType) })
    public enemyType: EnemyType = EnemyType.NEUTRAL;

    // --- Reward System ---
    @property({ type: CCFloat, tooltip: "Reward" })
    public goldReward: number = 20;

    protected start(): void {
        this.currentHp = this.maxHp;
        assert(this.hpText !== null, `Didn't set hp Text for ${this.node.name}`);
        this.updateHPText();
    }

    public takeDamage(baseDmg: number, type: DamageType = DamageType.PHYSICAL, holyBonus: number = 0) {
        const primaryMultiplier = WeaknessTable[this.enemyType][type];
        const finalPrimaryDmg = baseDmg * primaryMultiplier;

        const holyMultiplier = WeaknessTable[this.enemyType][DamageType.HOLY];
        const finalHolyDmg = (baseDmg * holyBonus) * holyMultiplier;

        const totalDamage = finalPrimaryDmg + finalHolyDmg;

        console.log(`[Combat] ${this.node.name} รับดาเมจ: ${totalDamage.toFixed(2)} (HP: ${this.currentHp.toFixed(2)} -> ${Math.max(this.currentHp - totalDamage, 0).toFixed(2)})`);

        this.currentHp -= totalDamage;

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.die();
        } else {
            this.updateHPText();
        }
    }

    private updateHPText() {
        if (this.hpText) {
            this.hpText.string = `${this.currentHp.toFixed(1)}/${this.maxHp}`;
        }
    }

    private die() {
        console.log(`[Enemy] ${this.node.name} Neutralized`);

        // แจกเงินรางวัล
        if (ResourceManager && ResourceManager.instance) {
            ResourceManager.instance.addGold(this.goldReward);
        }

        // แจ้ง event ว่าศัตรูถูกกำจัดแล้ว
        director.getScene().emit(GlobalEvent.ENEMY_REMOVED);

        // ทำลาย node
        this.node.destroy();
    }
}
