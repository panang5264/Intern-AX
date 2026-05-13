import { _decorator, Component, Label, Node, tween, v3, Color, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NotificationUI')
export class NotificationUI extends Component {
    public static instance: NotificationUI = null;

    @property(Label) messageLabel: Label = null;
    @property(Node) container: Node = null;

    onLoad() {
        NotificationUI.instance = this;
        if (this.container) this.container.active = false;

        // ดักฟัง Event แจ้งเตือน
        director.getScene().on("SHOW_NOTIFICATION", this.onShowNotification, this);
    }

    private onShowNotification(msg: string) {
        this.showMessage(msg, msg.includes("INSUFFICIENT"));
    }

    public showMessage(text: string, isError: boolean = true) {
        if (!this.messageLabel || !this.container) return;

        this.messageLabel.string = text;
        this.messageLabel.color = isError ? Color.RED : Color.YELLOW;

        // หยุด Tween เก่าถ้ามี
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
            })
            .start();
    }
}
