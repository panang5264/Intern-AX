import { _decorator, assert, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {
    protected start(): void {
        this.node.active = false
    }

    hide_setting(): void {
        this.node.active = false
    }
}
