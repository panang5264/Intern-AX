import { _decorator, assert, CCFloat, Component, instantiate, Node, Prefab } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { EnemyMovement } from './EnemyMovement';
const { ccclass, property } = _decorator;

@ccclass('WaveData')
export class WaveData {
    @property({ displayName: "Enemy Amt.", range: [1, 99, 1] })
    enemy_num: number = 0;

    @property({ displayName: "Spawn Freq.", tooltip: "Spawn Enemy in sec.", range: [0.1, 10, 0.1], slide: true })
    spawn_freq: number = 0.5;

    @property(Prefab) enemyPrefab: Prefab = null;
}

@ccclass('Wave')
export class Wave {
    @property([WaveData]) wave_data: WaveData[] = [];
    idx: number = 0;

    get_data(): WaveData { return this.wave_data[this.idx]; }
    is_done(): boolean { return this.idx >= this.wave_data.length; }
}

@ccclass('WaveManager')
export class WaveManager extends Component {
    @property(PathManager) path_manager: PathManager = null;
    @property([Wave]) waves: Wave[] = [];
    @property(Node) spawnPoint: Node = null;
    @property(CCFloat) duration: number = 5.0;

    private wave_idx: number = 0;

    protected start(): void {
        assert(this.spawnPoint !== null, "didn't set enemy spawn Point for WaveManager");
        assert(this.path_manager !== null, "didn't set PathManager for WaveManager");
        this.scheduleOnce(this.beginWave, this.duration);
    }

    private beginWave(): void {
        if (this.wave_idx >= this.waves.length) {
            return;
        }

        const data = this.waves[this.wave_idx].get_data();
        this.schedule(this.spawnEnemy, data.spawn_freq);
    }

    private spawnEnemy(): void {
        const wave = this.waves[this.wave_idx];
        const data = wave.get_data();

        const node = instantiate(data.enemyPrefab);
        node.setParent(this.node, true);
        node.setWorldPosition(this.spawnPoint.worldPosition);
        node.getComponent(EnemyMovement).pathManager = this.path_manager;

        data.enemy_num -= 1;
        if (data.enemy_num > 0) {
            return;
        }

        this.unschedule(this.spawnEnemy);
        wave.idx++;

        if (!wave.is_done()) {
            this.beginWave();
        } else {
            this.wave_idx++;
            if (this.wave_idx < this.waves.length) {
                this.scheduleOnce(this.beginWave, this.duration);
            }
        }
    }
}
