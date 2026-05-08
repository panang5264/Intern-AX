// assets/GameCode/Stages/WorldMapManager.ts
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { STAGE_LIST } from './StageConfig';
import { StageNode } from './StageNode';
const { ccclass, property } = _decorator;

@ccclass('WorldMapManager')
export class WorldMapManager extends Component {
    @property([StageNode]) stageNodes: StageNode[] = []; // ลาก StageNodes ใน Scene มาใส่ที่นี่

    start() {
        this.setupStages();
    }

    setupStages() {
        // วนลูปตั้งค่า Stage ตามข้อมูลที่มีใน Config
        for (let i = 0; i < this.stageNodes.length; i++) {
            const config = STAGE_LIST[i];
            if (config) {
                this.stageNodes[i].init(config.id, config.name, config.sceneName, config.preRequisiteId);
            }
        }
    }
}
