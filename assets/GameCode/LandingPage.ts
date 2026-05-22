import { _decorator, Component, director, Node, Scene, SceneAsset } from 'cc';
const { ccclass, property } = _decorator;

const LOGIN_SCENE = 'login'
const REGISTER_SCENE = 'register'

@ccclass('LandingPage')
export class LandingPage extends Component {

    public onLoad(): void {
        director.preloadScene(LOGIN_SCENE)
        director.preloadScene(REGISTER_SCENE)
    }

    on_login_button_pressed() {
        director.loadScene(LOGIN_SCENE)
    }

    on_register_button_pressed() {
        director.loadScene(REGISTER_SCENE)
    }
}
