import { _decorator, Component, Vec2, Input, input, EventMouse } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    private mouse_pos: Vec2 = new Vec2(0, 0)
    start() {
        console.log("enemey Init")
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
    onMouseMove(event: EventMouse) {
        event.getUILocation(this.mouse_pos)
    }
    update(deltaTime: number) {
        if (this.mouse_pos.equals(Vec2.ZERO)) {
            return
        }
        this.node.setWorldPosition(this.mouse_pos.x, this.mouse_pos.y, 0);
    }
}

