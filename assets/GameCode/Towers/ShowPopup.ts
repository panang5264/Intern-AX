import { _decorator, Component, Node, Input, EventMouse, Collider2D, assert } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShowPopup')
export class ShowPopup extends Component {
    @property(Node) clickableArea: Node = null
    @property(Node) popup: Node = null
    protected start(): void {
        assert(this.clickableArea !== null, "Please select click able area")
        assert(this.popup !== null, "Missing popup node")
        if (this.clickableArea)
            this.clickableArea.on(Input.EventType.MOUSE_DOWN, this.onClick, this)

    }

    onClick() {
        if (!this.popup) return;

        this.popup.active = !this.popup.active
    }
}
