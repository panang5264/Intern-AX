import { _decorator, assert, Color, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MessageLog')
export class MessageLog extends Component {
    @property(Node) container: Node = null
    count = 0;

    protected start(): void {
        assert(this.container != null, "Please set log container")
    }
    public add_log(msg: string) {
        let node = new Node("msg" + this.count)
        node.parent = this.container

        let label = node.addComponent(Label)
        label.color = Color.RED;
        label.string = msg;
        label.fontSize = 20;
    }

    public reset() {
        this.container.destroyAllChildren()
        this.count = 0;
    }
}
