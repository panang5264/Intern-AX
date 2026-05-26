import { _decorator, assert, Component, EventHandler, EventTarget, Node, RichText, } from 'cc';
import { UpgradeStat, TowerUpgrade, UpgradeData, UpgradeType } from './TowerUpgrade';
import fmtText, { FormatOptions } from '../Core/RichTextUtil';
const { ccclass, property } = _decorator;

@ccclass('UpgradePopup')
export class UpgradePopup extends Component {
    @property(RichText) text: RichText = null
    // cur_upgrad_stat: UpgradeStat[] = []
    protected start(): void {
        assert(this.text !== null, "Didn't assign upgrade's text")
    }


    public update_text(tier: number, upgradeStats: UpgradeStat[]): void {
        if (!this.text) return;
        const text = this.text
        const upgradeOptions: FormatOptions = { outlineWidth: 1 }
        const valueOptions: FormatOptions = { color: "#ffffff", outlineWidth: 1 }
        // this.cur_upgrad_stat = upgradeStats
        text.string = `${fmtText(`Tier ${tier} to`, valueOptions)} ${fmtText(`Tier ${tier + 1}`, upgradeOptions)}<br/>`

        for (const stat of upgradeStats) {
            text.string +=
                fmtText(`${UpgradeType[stat.attr]}: ${stat.value} to `, valueOptions) + fmtText(`${stat.upgrade_value}`, upgradeOptions) + "<br/>"
        }
    }

    public setMaxUpgrade() {
        this.text.string = "Max Upgrade"
    }
}
