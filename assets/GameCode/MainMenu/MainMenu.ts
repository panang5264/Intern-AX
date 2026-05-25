import { _decorator, assert, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
    @property(Node) setting: Node = null

    protected start(): void {
        assert(this.setting != null, "Can't find Setting node")
    }
    open_setting() {
        this.setting.active = true
    }
}
