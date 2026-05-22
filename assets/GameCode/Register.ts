import { _decorator, Component, director, Node } from 'cc';
import { SceneName } from './Core/Constant';
const { ccclass, property } = _decorator;

@ccclass('Register')
export class Register extends Component {
    username = "";
    email = "";
    password = "";
    confirm_password = "";

    on_register_button_pressed() {
        console.log({
            username: this.username,
            email: this.email,
            password: this.password,
            confirm_password: this.confirm_password
        });

        if (this.password !== this.confirm_password) {
            console.error("password doesn't match");
            console.log(this.password);
            console.log(this.confirm_password);
        }
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
