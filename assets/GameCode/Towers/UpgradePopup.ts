import { _decorator, assert, Component, EventHandler, EventTarget, Input, Node, RichText, } from 'cc';
import { UpgradeStat, TowerUpgrade, UpgradeData, UpgradeType } from './TowerUpgrade';
import fmtText, { FormatOptions } from '../Core/RichTextUtil';
const { ccclass, property } = _decorator;

@ccclass('UpgradePopup')
export class UpgradePopup extends Component {
    @property(RichText) text: RichText = null
    @property(Node) clickableArea: Node = null
    @property(Node) popup: Node = null
    // cur_upgrad_stat: UpgradeStat[] = []
    protected start(): void {
        this.popup.active = false
        assert(this.text !== null, "Didn't assign upgrade's text")
        assert(this.clickableArea !== null, "Please select click able area")
        assert(this.popup !== null, "Missing popup node")
        if (this.clickableArea)
            this.clickableArea.on(Input.EventType.MOUSE_DOWN, this.onClick, this)
    }

    onClick() {
        if (!this.popup) return;
        this.popup.active = !this.popup.active
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
