// assets/GameCode/Stages/StageNode.ts
import { _decorator, Component, Node, Label, Button, director, Color, Sprite } from 'cc';
import { StageDataManager } from './StageDataManager';
const { ccclass, property } = _decorator;

@ccclass('StageNode')
export class StageNode extends Component {
    @property(Label) stageLabel: Label = null;

    private _stageId: number = 0;
    private _sceneToLoad: string = "";
    private _isUnlocked: boolean = false;

    public init(id: number, name: string, sceneName: string, preReqId: number | null) {
        this._stageId = id;
        this._sceneToLoad = sceneName;
        this.stageLabel.string = name;


        this._isUnlocked = StageDataManager.instance.isStageUnlocked(id, preReqId);
        this.updateVisual();
    }

    updateVisual() {
        const btn = this.getComponent(Button);
        const sprite = this.getComponent(Sprite);

        if (this._isUnlocked) {
            btn.interactable = true;
            if (sprite) sprite.color = Color.WHITE;
        } else {
            btn.interactable = false;
            if (sprite) sprite.color = Color.GRAY;
        }
    }

    onStageClick() {
        if (this._isUnlocked) {
            console.log("Loading Stage: " + this._sceneToLoad);
            director.loadScene(this._sceneToLoad);
        }
    }
}
