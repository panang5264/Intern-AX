import { _decorator, Component, director, Node, Scene, SceneAsset } from 'cc';
import { SceneName } from './Core/Constant';
const { ccclass, property } = _decorator;


@ccclass('LandingPage')
export class LandingPage extends Component {

    public onLoad(): void {
        director.preloadScene(SceneName.LOGIN)
        director.preloadScene(SceneName.REGISTER)
    }

    on_login_button_pressed() {
        director.loadScene(SceneName.LOGIN)
    }

    on_register_button_pressed() {
        director.loadScene(SceneName.REGISTER)
    }
}
