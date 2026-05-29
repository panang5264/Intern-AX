import { _decorator, assert, Component, Enum, Node, EventTarget, Button, EventHandler, Label } from 'cc';
import { TowerController } from './TowerController';
import { GlobalEvent } from '../Core/Constant';
import { UpgradePopup } from './UpgradePopup';
import { ResourceManager } from '../Core/ResourceManager';
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
    tower_value: number = 0;
    @property(UpgradePopup) upgradePopup: UpgradePopup = null;
    @property(Button) upgradeButton: Button = null;
    @property(Button) sellButton: Button = null;
    @property([UpgradeData]) upgradelist: UpgradeData[] = [];

    max_upgrade: boolean = false;
    cur_data: UpgradeData = null
    cur_stats: UpgradeStat[] = []

    protected start(): void {
        this.tower_ctrl = this.node.getComponent(TowerController)
        assert(this.tower_ctrl !== null, "Couldn't find TowerController Component")
        assert(this.upgradeButton !== null, "Didn't set upgradeButton")
        assert(this.sellButton !== null, "Didn't set sellButton")

        if (this.tower_ctrl) {
            this.tower_value = this.tower_ctrl.cost;
            this.update_sellLabel();
        }

        const data = this.getUpgrade()
        const stats = this.getTowerStat(data)
        this.upgradePopup.update_text(this.cur_tier, stats)
        this.cur_data = data
        this.cur_stats = stats;

        if (this.cur_data) {
            this.update_updateLabel();
        }

        if (!this.sellButton || !this.upgradeButton) return;
        const upgradeHandler = new EventHandler()
        upgradeHandler.target = this.node
        upgradeHandler.component = "TowerUpgrade"
        upgradeHandler.handler = 'upgrade'
        this.upgradeButton.clickEvents.push(upgradeHandler)

        const sellHandler = new EventHandler()
        sellHandler.target = this.node
        sellHandler.component = "TowerUpgrade"
        sellHandler.handler = 'sellTower'
        this.sellButton.clickEvents.push(sellHandler)
    }

    protected update(dt: number): void {
        if (!this.cur_data || this.max_upgrade) return;
        if (ResourceManager.instance.getGold() < this.cur_data.price) {
            this.upgradeButton.enabled = false
        } else {
            this.upgradeButton.enabled = true
        }
    }

    public upgrade(event: Event, customeData: string): void {
        if (!this.cur_stats || !this.cur_data) console.log("stats or upgrade data is null");
        const price = this.cur_data.price
        this.tower_value += price
        this.update_sellLabel()
        this.tower_ctrl.upgrade(this.cur_stats);
        ResourceManager.instance.spendGold(price);
        this.cur_tier += 1;

        if (this.cur_tier - 1 >= this.upgradelist.length) {
            this.max_upgrade = true
            this.upgradePopup.setMaxUpgrade()
            this.upgradeButton.node.active = false
            return
        }

        const data = this.getUpgrade()
        const stats = this.getTowerStat(data)
        this.upgradePopup.update_text(this.cur_tier, stats)
        this.cur_stats = stats;
    }
    update_sellLabel() {
        const value = this.tower_value / 2;
        const label = this.sellButton.node.getComponentInChildren(Label)
        label.string = `Sell (${Math.trunc(value)} g)`
    }
    update_updateLabel() {
        const value = this.cur_data.price
        const label = this.upgradeButton.node.getComponentInChildren(Label)
        label.string = `Upgrade (${value} g)`
    }

    sellTower() {
        const value = this.tower_value / 2;
        ResourceManager.instance.addGold(Math.trunc(value))
        this.node.destroy()
    }

    public getUpgrade(): UpgradeData {
        return this.upgradelist.shift();
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
                        value: this.tower_ctrl.towerRange,
                        upgrade_value: u.range,
                    }
                    break;
                case UpgradeType.Hit:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.hit_number,
                        upgrade_value: u.hit,
                    }
                    break;
                case UpgradeType.SplashArea:
                    stat = {
                        attr: u.type,
                        value: this.tower_ctrl.splashRadius, // WARN: not yet implement GetSplashRange from TowerController or ignore 
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
                        value: this.tower_ctrl.buffEff,
                        upgrade_value: u.buff_eff,
                    }
                    break;
            }
            if (stat) stats.push(stat)
        }
        return stats
    }
}
