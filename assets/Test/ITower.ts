import { DetectionArea } from "./detection_area";
import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface ITower {
    InTowerRangeBound: (node: Node) => void;
    OutTowerRangeBound: (node: Node) => void;
    InTowerRange(detectObj: Node): void;
    OutTowerRange(detectObj: Node): void;
}
