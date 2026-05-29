import { _decorator, Component, Label, Node, tween, v3, Color, director } from 'cc';
import { GlobalEvent } from '../Core/Constant';
const { ccclass, property } = _decorator;

@ccclass('NotificationUI')
export class NotificationUI extends Component {
    public static instance: NotificationUI = null;

    @property(Label) messageLabel: Label = null;
    @property(Node) container: Node = null;

    private _queue: { text: string, isError: boolean }[] = [];
    private _isShowing: boolean = false;

    onLoad() {
        NotificationUI.instance = this;
        if (this.container) this.container.active = false;

        director.getScene().on(GlobalEvent.SHOW_NOTI, this.onShowNotification, this);
    }

    onDestroy() {
        director.getScene().off(GlobalEvent.SHOW_NOTI, this.onShowNotification, this);
    }

    private onShowNotification(msg: string) {
        this.showMessage(msg, msg.includes("INSUFFICIENT"));
    }

    public showMessage(text: string, isError: boolean = false) {
        // เพิ่มเข้า Queue
        this._queue.push({ text, isError });
        if (!this._isShowing) this._processQueue();
    }

    private _processQueue() {
        if (this._queue.length === 0) {
            this._isShowing = false;
            return;
        }

        this._isShowing = true;
        const { text, isError } = this._queue.shift();

        if (!this.messageLabel || !this.container) return;

        this.messageLabel.string = text;
        this.messageLabel.color = isError ? Color.RED : Color.YELLOW;

        tween(this.container).stop();
        this.container.active = true;
        this.container.setScale(v3(0.5, 0.5, 1));

        // Animation เด้งขึ้นมาแล้วค่อยๆ หายไป
        tween(this.container)
            .to(0.1, { scale: v3(1.2, 1.2, 1) }, { easing: 'backOut' })
            .to(0.1, { scale: v3(1, 1, 1) })
            .delay(1.5)
            .to(0.2, { scale: v3(0, 0, 1) }, { easing: 'backIn' })
            .call(() => {
                this.container.active = false;
                // แสดงอันถัดไปใน Queue
                this._processQueue();
            })
            .start();
    }
}