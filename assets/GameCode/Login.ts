import { _decorator, Component, director, MaskType, Node } from 'cc';
import { SceneName } from './Core/Constant';
import { MessageLog } from './MessageLog';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    username: string = ""
    password: string = ""
    @property(MessageLog) msgLog: MessageLog = null
    on_login_button_pressed() {
        this.msgLog.reset()
        let valid = true
        if (this.username === "") {
            this.msgLog.add_log("Please enter username")
            valid = false
        }
        if (this.password === "") {
            this.msgLog.add_log("Please enter password")
            valid = false
        }
        if (valid) director.loadScene(SceneName.MAINMENU);
    }

    back_to_landing_page() {
        this.msgLog.reset()
        director.loadScene(SceneName.LANDING_PAGE)
    }
    on_username_text_change(text: string) {
        console.log(text)
        this.username = text
    }

    on_password_text_change(text: string) {
        console.log(text)
        this.password = text;
    }
}
