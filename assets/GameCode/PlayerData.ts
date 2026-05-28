import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData extends Component {
    public static instance: PlayerData = null;
    private _scroll = 0;
    private _diamon = 0;

    public get scroll() {
        return this._scroll;
    }
    public addScroll(value: number) {
        this._scroll += value;
    }
    public spendScroll(value: number) {
        this._scroll -= value;
    }

    public get diamon() {
        return this._diamon;
    }
    public addDiamond(value: number) {
        this._diamon += value;
    }
    public spendDiamond(value: number) {
        this._diamon -= value;
    }

    protected onLoad(): void {
        if (PlayerData.instance == null) {
            PlayerData.instance = this;
            director.addPersistRootNode(this.node);
        } else {
            this.node.destroy(); // Prevent duplicates
            return;
        }
    }
}
