import { _decorator, assert, CCFloat, Component, instantiate, macro, Node, Prefab } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { EnemyMovement } from './EnemyMovement';
const { ccclass, property } = _decorator;

@ccclass('WaveData')
export class WaveData {
    @property({ displayName: "Enemy Amt.", range: [1, 99, 1] })
    enemy_num: number = 0;

    @property({ displayName: "Start at", tooltip: "Start Spawn Enemy after ? sec." })
    start_at: number = 0;

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
    private spawnCallbacks: Map<WaveData, () => void> = new Map();

    protected start(): void {
        assert(this.spawnPoint !== null, "didn't set enemy spawn Point for WaveManager");
        assert(this.path_manager !== null, "didn't set PathManager for WaveManager");
        this.scheduleOnce(this.beginWave, this.duration);
    }

    private beginWave(): void {
        if (this.wave_idx >= this.waves.length) {
            return;
        }

        const wave = this.waves[this.wave_idx];
        for (let data of wave.wave_data) {
            const cb = this.spawnEnemy.bind(this, data);
            this.spawnCallbacks.set(data, cb);
            this.schedule(cb, data.spawn_freq, macro.REPEAT_FOREVER, data.start_at);
        }
    }

    private spawnEnemy(data: WaveData): void {
        const wave = this.waves[this.wave_idx];
        if (wave == null) {
            return;
        }

        const node = instantiate(data.enemyPrefab);
        node.setParent(this.node, true);
        node.setWorldPosition(this.spawnPoint.worldPosition);
        node.getComponent(EnemyMovement).pathManager = this.path_manager;

        data.enemy_num -= 1;
        if (data.enemy_num > 0) {
            return;
        }

        this.unschedule(this.spawnCallbacks.get(data));
        this.spawnCallbacks.delete(data);
        wave.idx++;
        if (wave.is_done()) {
            this.wave_idx += 1;
            this.scheduleOnce(this.beginWave, this.duration);
        }
    }
}
