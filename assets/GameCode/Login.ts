import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    username: string = ""
    password: string = ""
    on_login_button_pressed() {
        console.log(`Username: ${this.username}
Password: ${this.password}`)
    }

    back_to_landing_page() {
        director.loadScene('landing_page');
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
