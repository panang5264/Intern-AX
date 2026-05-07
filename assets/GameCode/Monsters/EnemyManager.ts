import { _decorator, assert, CCFloat, Component, director, instantiate, Node, Prefab } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { EnemyMovement } from './EnemyMovement';
const { ccclass, property } = _decorator;

enum EnemyStage {
    Spawn,
    Wait,
}

@ccclass('WaveData')
export class WaveData {

    @property
    enemy_num: number = 0;

    @property
    spawn_freq: number = 0;

    cur_spawn_time: number = 0;
}

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    @property(Prefab) enemyPrefab: Prefab = null
    @property(PathManager) path_manager: PathManager = null
    @property([WaveData])
    waves: WaveData[] = [];
    wave_idx = 0;

    @property(Node) spawnPoint: Node = null;
    @property(CCFloat) duration: number = 5.0;
    cur_duration: number = 0.0;
    cur_stage: EnemyStage = EnemyStage.Wait;
    cur_spawn_time: number = 0.0;

    protected start(): void {
        assert(this.enemyPrefab !== null, "enemy prefab is null")
        assert(this.spawnPoint !== null, "didn't set enemy spawn Point")
        assert(this.path_manager !== null, "didn't set PathManager for EnemyManager")
    }

    protected update(dt: number): void {
        if (this.wave_idx >= this.waves.length) {
            return
        }

        switch (this.cur_stage) {
            case EnemyStage.Spawn:
                console.log("spawn")
                let wave = this.waves[this.wave_idx]
                wave.cur_spawn_time += dt;
                if (wave.cur_spawn_time >= wave.spawn_freq) {
                    wave.enemy_num -= 1;
                    wave.cur_spawn_time = 0;
                    let node = instantiate(this.enemyPrefab)
                    let enemyMovement = node.getComponent(EnemyMovement)
                    enemyMovement.set_path_manager(this.path_manager)
                    node.setWorldPosition(this.spawnPoint.worldPosition)
                    node.setParent(this.node, true)
                }

                if (wave.enemy_num <= 0) {
                    this.cur_stage = EnemyStage.Wait
                    this.wave_idx += 1;
                }
                break;
            case EnemyStage.Wait:
                console.log("wait")
                this.cur_duration += dt;
                if (this.cur_duration >= this.duration) {
                    this.cur_stage = EnemyStage.Spawn
                    this.cur_duration = 0;
                }
                break;
        }


    }
}


