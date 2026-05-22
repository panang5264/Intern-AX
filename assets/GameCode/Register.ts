import { _decorator, assert, Component, director, Node } from 'cc';
import { SceneName } from './Core/Constant';
import { MessageLog } from './MessageLog';
const { ccclass, property } = _decorator;

@ccclass('Register')
export class Register extends Component {
    username = "";
    email = "";
    password = "";
    confirm_password = "";
    @property(MessageLog) msgLog: MessageLog = null;

    protected start(): void {
        assert(this.msgLog != null, "Please set MessageLog");
    }

    on_register_button_pressed() {
        this.msgLog.reset()
        console.log({
            username: this.username,
            email: this.email,
            password: this.password,
            confirm_password: this.confirm_password
        });
        let valid = true;

        if (this.username === "") {
            this.msgLog.add_log("Please enter username")
            valid = false
        }
        if (this.email === "") {
            this.msgLog.add_log("Please enter email")
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            this.msgLog.add_log("Please enter a valid email")
            valid = false
        }

        if (this.password === "") {
            this.msgLog.add_log("Please enter password")
            valid = false
        } else if (this.confirm_password === "") {
            this.msgLog.add_log("Please confirm your password")
            valid = false
        } else if (this.password !== this.confirm_password) {
            this.msgLog.add_log("password doesn't match")
            valid = false
        }

        if (valid) director.loadScene(SceneName.MAINMENU)
    }

    back_to_landing_page() {
        director.loadScene(SceneName.LANDING_PAGE);
    }

    on_username_change(text: string) {
        this.username = text
    }
    on_email_change(text: string) {
        this.email = text
    }
    on_password_change(text: string) {
        this.password = text
    }
    on_confirm_password_change(text: string) {
        this.confirm_password = text
    }
}
