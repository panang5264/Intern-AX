import { _decorator, assert, CCFloat, Component, director, instantiate, Node, Prefab } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { EnemyMovement } from './EnemyMovement';
const { ccclass, property } = _decorator;

enum WaveStatus {
    Spawn,
    Wait,
}

@ccclass('WaveData')
export class WaveData {
    @property(
        {
            displayName: "Enemy Amt.",
            range: [1, 99, 1],
        }
    )
    enemy_num: number = 0;

    @property(
        {
            displayName: "Spawn Freq.",
            tooltip: "Spawn Enemy in sec.",
            range: [0.1, 10, 0.1],
            slide: true,
        }
    )
    spawn_freq: number = 0.5;
    @property(Prefab) enemyPrefab: Prefab = null;
}

@ccclass('Wave')
export class Wave {
    @property([WaveData]) wave_data: WaveData[] = []
    cur_time: number = 0;
    idx: number = 0;
    get_data(): WaveData {
        return this.wave_data[this.idx]
    }
    is_done(): boolean {
        return this.idx >= this.wave_data.length
    }
}


@ccclass('WaveManager')
export class WaveManager extends Component {
    @property(PathManager) path_manager: PathManager = null
    @property([Wave]) waves: Wave[] = [];
    wave_idx = 0;

    @property(Node) spawnPoint: Node = null;
    @property(CCFloat) duration: number = 5.0;
    cur_duration: number = 0.0;
    cur_stage: WaveStatus = WaveStatus.Wait;
    cur_spawn_time: number = 0.0;

    protected start(): void {
        assert(this.spawnPoint !== null, "didn't set enemy spawn Point for WaveManager")
        assert(this.path_manager !== null, "didn't set PathManager for WaveManager")
    }

    protected update(dt: number): void {
        if (this.wave_idx >= this.waves.length) {
            return
        }

        switch (this.cur_stage) {
            case WaveStatus.Spawn:
                const wave = this.waves[this.wave_idx];
                if (wave.is_done()) {
                    this.cur_stage = WaveStatus.Wait;
                    this.wave_idx += 1;
                    break;
                }

                const data = wave.get_data()
                assert(data != null, "Data is null")
                wave.cur_time += dt;
                if (wave.cur_time >= data.spawn_freq) {
                    wave.cur_time = 0;
                    data.enemy_num -= 1;
                    let node = instantiate(data.enemyPrefab)
                    node.setParent(this.node, true)
                    node.setWorldPosition(this.spawnPoint.worldPosition)
                    let enemy = node.getComponent(EnemyMovement)
                    enemy.pathManager = this.path_manager

                }

                if (data.enemy_num <= 0) {
                    wave.idx += 1;
                }
                break;
            case WaveStatus.Wait:
                console.log("wait")
                this.cur_duration += dt;
                if (this.cur_duration >= this.duration) {
                    this.cur_stage = WaveStatus.Spawn
                    this.cur_duration = 0;
                }
                break;
        }
    }
}
