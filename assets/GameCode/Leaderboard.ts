import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("Leaderboard")
export class Leaderboard extends Component {
    protected start(): void {
        this.node.active = false;
    }
    close_leaderboard() {
        this.node.active = false;
    }
}
