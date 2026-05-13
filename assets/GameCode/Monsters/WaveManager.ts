// assets/GameCode/Monsters/WaveManager.ts

import { _decorator, assert, CCFloat, Component, director, instantiate, macro, Node, Prefab } from 'cc';
import { PathManager } from '../Stages/PathManager';
import { EnemyMovement } from './EnemyMovement';
import { ResourceManager } from '../CoreSystems/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('WaveData')
export class WaveData {
    @property({ displayName: "Enemy Type Name" })
    name: string = "Normal Enemy";

    @property({ displayName: "Enemy Amt.", range: [1, 99, 1] })
    enemy_num: number = 0;

    // เก็บค่าตั้งต้นไว้เพื่อไม่ให้โดนหักลบจนหายไป (เผื่อใช้ Restart)
    public remaining_enemies: number = 0;

    @property({ displayName: "Start at", tooltip: "Start Spawn Enemy after ? sec." })
    start_at: number = 0;

    @property({ displayName: "Spawn Freq.", tooltip: "Spawn Enemy in sec.", range: [0.1, 10, 0.1], slide: true })
    spawn_freq: number = 0.5;

    @property(Prefab) enemyPrefab: Prefab = null;
}

@ccclass('Wave')
export class Wave {
    @property([WaveData]) wave_data: WaveData[] = [];

    @property({ displayName: "Gold Reward" })
    public goldReward: number = 100;

    private _finishedGroups: number = 0;

    public reset() {
        this._finishedGroups = 0;
        this.wave_data.forEach(d => d.remaining_enemies = d.enemy_num);
    }

    public markGroupDone() { this._finishedGroups++; }
    public isAllSpawned(): boolean { return this._finishedGroups >= this.wave_data.length; }
}

@ccclass('WaveManager')
export class WaveManager extends Component {
    @property(PathManager) path_manager: PathManager = null;
    @property([Wave]) waves: Wave[] = [];
    @property(Node) spawnPoint: Node = null;

    @property({ type: CCFloat, displayName: "Wait Before First Wave" })
    firstWaveDelay: number = 5.0;

    @property({ type: CCFloat, displayName: "Rest Duration", tooltip: "เวลาพักระหว่างเวฟ (วินาที)" })
    restDuration: number = 10.0;

    private wave_idx: number = 0;
    private spawnCallbacks: Map<WaveData, () => void> = new Map();
    private isResting: boolean = false;

    protected start(): void {
        assert(this.spawnPoint !== null, "didn't set enemy spawn Point for WaveManager");
        assert(this.path_manager !== null, "didn't set PathManager for WaveManager");

        // เริ่มต้นด้วยการพักก่อนเข้า Wave 1
        this.startRestTimer(this.firstWaveDelay);
    }

    private startRestTimer(duration: number) {
        this.isResting = true;
        console.log(`[Wave] Resting for ${duration}s...`);
        // คำนวณรางวัลที่เพิ่งได้รับ (ถ้าเริ่มเกม wave_idx เป็น 0 ให้รางวัลเป็น 0)
        const lastWaveReward = (this.wave_idx === 0) ? 0 : this.waves[this.wave_idx - 1].goldReward;
        // ส่ง Event ไปบอก UI ให้แสดงข้อมูลการพักและรางวัล
        director.getScene().emit("WAVE_RESTING", {
            duration: duration,
            nextWave: this.wave_idx + 1,
            totalWaves: this.waves.length,
            reward: lastWaveReward
        });
        this.scheduleOnce(this.beginWave, duration);
    }

    public skipRest() {
        if (!this.isResting) return;

        console.log("[Wave] Skip Rest!");
        this.unschedule(this.beginWave);
        this.beginWave();
    }

    private beginWave(): void {
        this.isResting = false;
        if (this.wave_idx >= this.waves.length) {
            console.log("[Wave] All waves completed!");
            return;
        }

        const wave = this.waves[this.wave_idx];
        wave.reset(); // รีเซ็ตจำนวนศัตรูที่จะเกิดในเวฟนี้

        director.getScene().emit("WAVE_STARTED", {
            currentWave: this.wave_idx + 1,
            totalWaves: this.waves.length,
            income: wave.goldReward
        });

        console.log(`[Wave] Start Wave ${this.wave_idx + 1}`);

        for (let data of wave.wave_data) {
            const cb = this.spawnEnemy.bind(this, data);
            this.spawnCallbacks.set(data, cb);
            this.schedule(cb, data.spawn_freq, macro.REPEAT_FOREVER, data.start_at);
        }
    }

    private spawnEnemy(data: WaveData): void {
        const wave = this.waves[this.wave_idx];
        if (!wave) return;

        // สร้างศัตรู
        const node = instantiate(data.enemyPrefab);
        node.setParent(this.node, true);
        node.setWorldPosition(this.spawnPoint.worldPosition);
        node.getComponent(EnemyMovement).pathManager = this.path_manager;

        data.remaining_enemies -= 1;

        // ถ้ากลุ่มนี้ปล่อยครบแล้ว
        if (data.remaining_enemies <= 0) {
            this.unschedule(this.spawnCallbacks.get(data));
            this.spawnCallbacks.delete(data);

            wave.markGroupDone();

            // ถ้าทุกกลุ่มในเวฟนี้ปล่อยครบแล้ว
            if (wave.isAllSpawned()) {
                this.onWaveSpawnComplete(wave);
            }
        }
    }

    private onWaveSpawnComplete(wave: Wave) {
        console.log(`[Wave] Wave ${this.wave_idx + 1} spawn complete!`);

        if (ResourceManager.instance) {
            ResourceManager.instance.addGold(wave.goldReward);
        }

        this.wave_idx += 1;

        // ถ้ายังมีเวฟถัดไป ให้เริ่มพัก
        if (this.wave_idx < this.waves.length) {
            this.startRestTimer(this.restDuration);
        } else {
            console.log("[Wave] Victory! All enemies spawned.");
            // ส่ง Event บอกว่าจบเกมหรือชนะแล้ว (ถ้าต้องการ)
        }
    }
}
