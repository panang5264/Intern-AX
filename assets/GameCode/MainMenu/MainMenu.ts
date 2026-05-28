import { _decorator, assert, Component, Label, Node } from 'cc';
import { PlayerData } from '../PlayerData';
const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
    @property(Node) setting: Node = null;
    @property(Node) leaderBoard: Node = null;
    @property(Label) scrollLabel: Label = null;
    @property(Label) diamonLabel: Label = null;

    protected start(): void {
        assert(this.setting != null, "Can't find Setting node")
        assert(this.leaderBoard != null, "Can't find Setting node")
        assert(this.scrollLabel != null, "Didn't Set scrollLabel")
        assert(this.diamonLabel != null, "Didn't Set diamonLabel")
    }
    open_setting() {
        this.setting.active = true
    }

    open_leaderboard() {
        this.leaderBoard.active = true
    }

    update() {
        const scroll = PlayerData.instance.scroll;
        const diamon = PlayerData.instance.diamon;
        if (this.scrollLabel) this.scrollLabel.string = `Scroll: ${scroll}`;
        if (this.diamonLabel) this.diamonLabel.string = `Diamon: ${diamon}`;
    }
}
