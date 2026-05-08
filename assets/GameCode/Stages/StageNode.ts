// assets/GameCode/Stages/StageNode.ts
import { _decorator, Component, Node, Label, Button, director, Color, Sprite } from 'cc';
import { StageDataManager } from './StageDataManager';
import { StageConfig, STAGE_LIST } from './StageConfig';

const { ccclass, property } = _decorator;

@ccclass('StageNode')
export class StageNode extends Component {
    @property(Label) stageLabel: Label = null;
    @property(Number) stageId: number = 1;
    @property(String) sceneName: string = "";

    private _isUnlocked: boolean = false;

    start() {
        const config = STAGE_LIST.find(s => s.id === this.stageId);


        if (config && this.stageLabel) {
            this.stageLabel.string = config.name;
        }

        const preReqId = config ? config.preRequisiteId : null;
        this._isUnlocked = StageDataManager.instance.isStageUnlocked(this.stageId, preReqId);
        this.updateVisual();

        const btn = this.getComponent(Button);
        if (btn) {
            this.node.on(Button.EventType.CLICK, this.onStageClick, this);
        }
    }

    updateVisual() {
        const btn = this.getComponent(Button);
        const sprite = this.getComponent(Sprite);

        if (this._isUnlocked) {
            if (btn) btn.interactable = true;
            if (sprite) sprite.color = Color.WHITE;
        } else {
            if (btn) btn.interactable = false;
            if (sprite) sprite.color = Color.GRAY;
        }
    }

    onStageClick() {
        if (this._isUnlocked) {
            if (this.sceneName !== "") {
                console.log("กำลังโหลดด่าน: " + this.sceneName);
                director.loadScene(this.sceneName);
            } else {
                console.warn("ยังไม่ได้ใส่ชื่อ Scene ใน Inspector สำหรับด่านที่ " + this.stageId);
            }
        } else {
            console.log("ด่านนี้ยังไม่ปลดล็อค!");
        }
    }
}
