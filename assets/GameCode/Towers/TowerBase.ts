import { _decorator, Component, Node, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TowerBase')
export class TowerBase extends Component {
    @property({ tooltip: 'Damage per shot' })
    public damage: number = 10;

    @property({ tooltip: 'Attack range in pixels' })
    public range: number = 300;

    @property({ tooltip: 'Cooldown between shots (seconds)' })
    public attackCooldown: number = 1.0;

    private _timer: number = 0;

    update(dt: number) {
        this._timer += dt;
        if (this._timer >= this.attackCooldown) {
            if (this.findTargetAndShoot()) {
                this._timer = 0;
            }
        }
    }

    protected findTargetAndShoot(): boolean {
        // Implementation for finding nearest enemy within range
        // This is a placeholder for actual logic
        // console.log("Tower searching for target...");
        return false;
    }
}
