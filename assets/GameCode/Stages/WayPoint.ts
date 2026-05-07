import { _decorator, assert, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WayPoint')
export class WayPoint extends Component {
    @property(CCInteger) id: number = -1
}
