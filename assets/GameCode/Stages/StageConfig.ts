import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StageConfig')
export class StageConfig extends Component {
}
export interface StageData {
    id: number;
    name: string;
    sceneName: string;
    preRequisiteId: number | null;
}
export const STAGE_LIST: StageData[] = [
    { id: 1, name: "Stage 1", sceneName: "Ruined_village", preRequisiteId: null }
    //{ id: 2, name: "Stage 2", sceneName: "GameStage2", preRequisiteId: 1 },

];

