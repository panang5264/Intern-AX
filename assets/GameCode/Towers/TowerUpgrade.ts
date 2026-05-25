import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

/* NOTE: Upgrade Attribute
* - Damage
* - Range
* - Hit
* - Splash Area
* - Gold Generate
* - Buff Effective
*/

enum UpgradeType {
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
        tooltip: "Tower's Damage"
    })
    damage: number = 0;

    @property({
        visible() { return this.type === UpgradeType.Range },
        tooltip: "Tower's Range"
    })
    range: number = 0;

    @property({
        visible() { return this.type === UpgradeType.Hit },
        tooltip: "Tower attack x times"
    })
    hit: number = 0;

    @property({
        visible() { return this.type === UpgradeType.SplashArea },
        tooltip: "Explode Area of Bullet"
    })
    area: number = 0;

    @property({
        visible() { return this.type === UpgradeType.GoldGenerate },
        tooltip: "Generate x gold",
    })
    gold_generate: number = 0;

    @property({
        visible() { return this.type === UpgradeType.BuffEffective },
        tooltip: "Increase Buff's Effective (Percentage)",
    })
    buff_eff: number = 0;
}


@ccclass('UpgradeData')
export class UpgradeData {
    @property([Attribute]) attr_list: Attribute[] = [];
}

@ccclass('TowerUpgrade')
export class TowerUpgrade extends Component {
    tier: number = 1
    @property([UpgradeData]) upgradelist: UpgradeData[] = [];
}
