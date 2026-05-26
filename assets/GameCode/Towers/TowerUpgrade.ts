import { _decorator, assert, Component, Enum, Node, EventTarget } from 'cc';
import { TowerController } from './TowerController';
import { GlobalEvent } from '../Core/Constant';
import { UpgradePopup } from './UpgradePopup';
const { ccclass, property } = _decorator;

/* NOTE: Upgrade Attribute
* - Damage
* - Range
* - Hit
* - Splash Area
* - Gold Generate
* - Buff Effective
*/

export enum UpgradeType {
    NONE,
    Damage,
    Range,
    Hit,
    SplashArea,
    GoldGenerate,
    BuffEffective,
}

@ccclass('Attribute')
export class Attribute {
    @property({ type: Enum(UpgradeType) }) type: UpgradeType = UpgradeType.NONE;
    @property({
        visible() { return this.type === UpgradeType.Damage },
        tooltip: "Tower's Damage (Number)"
    })
    damage: number = 0;

    @property({
        visible() { return this.type === UpgradeType.Range },
        tooltip: "Tower's Range (Radius)"
    })
    range: number = 0;

    @property({
        visible() { return this.type === UpgradeType.Hit },
        tooltip: "Tower attack x times (Number)"
    })
    hit: number = 0;

    @property({
        visible() { return this.type === UpgradeType.SplashArea },
        tooltip: "Explode Area of Bullet (Radius)"
    })
    area: number = 0;

    @property({
        visible() { return this.type === UpgradeType.GoldGenerate },
        tooltip: "Generate x gold (Number)",
    })
    gold_generate: number = 0;

    @property({
        visible() { return this.type === UpgradeType.BuffEffective },
        tooltip: "Increase Buff's Effective (Percentage)",
    })
    buff_eff: number = 0;

}


export type UpgradeStat = {
    attr: UpgradeType
    value: number
    upgrade_value: number
}

@ccclass('UpgradeData')
export class UpgradeData {
    @property([Attribute]) attr_list: Attribute[] = [];
    @property public price: number = 0;
}


@ccclass('TowerUpgrade')
export class TowerUpgrade extends Component {
    cur_tier: number = 1
    tower_ctrl: TowerController = null
    @property(UpgradePopup) upgradPopup: UpgradePopup = null;

    @property([UpgradeData]) upgradelist: UpgradeData[] = [];

    protected start(): void {
        this.tower_ctrl = this.node.getComponent(TowerController)
        assert(this.tower_ctrl !== null, "Couldn't find TowerController Component")

        const data = this.getUpgrade()
        const stats = this.getTowerStat(data)
        this.upgradPopup.update_text(this.cur_tier, stats)
    }

    public upgrade(event: Event, customeData: string): void {
        console.log("upgrade")
        const data = this.getUpgrade()
        this.cur_tier += 1;
    }

    public getUpgrade(): UpgradeData {
        const index = this.cur_tier - 1
        return this.upgradelist[index];
    }

    public getCurTier(): number {
        return this.cur_tier;
    }

    getTowerStat(data: UpgradeData): UpgradeStat[] {
        if (data === null) return null;

        let stats = new Array<UpgradeStat>()
        for (const u of data.attr_list) {
            let stat: UpgradeStat
            switch (u.type) {
                case UpgradeType.Damage:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.damage,
                        upgrade_value: u.damage,
                    }
                    break;
                case UpgradeType.Range:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.attackRange,
                        upgrade_value: u.range,
                    }
                    break;
                case UpgradeType.Hit:
                    // WARN: not implement
                    throw Error("Not Implement")
                case UpgradeType.SplashArea:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.damage, // WARN: not yet implement GetSplashRange from TowerController or ignore 
                        upgrade_value: u.area,
                    }
                    break;
                case UpgradeType.GoldGenerate:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.goldGenerated,
                        upgrade_value: u.gold_generate,
                    }
                    break;
                case UpgradeType.BuffEffective:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.damage, // WARN: not yet implement GetSplashRange from TowerController or ignore
                        upgrade_value: u.damage,
                    }
                    break;
            }
            if (stat) stats.push(stat)
        }
        return stats
    }
}
