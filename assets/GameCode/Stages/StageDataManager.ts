// assets/GameCode/Stages/StageDataManager.ts
import { _decorator } from 'cc';

export class StageDataManager {
    private static _instance: StageDataManager;
    private clearedStages: number[] = [1];

    public static get instance(): StageDataManager {
        if (!this._instance) {
            this._instance = new StageDataManager();
        }
        return this._instance;
    }

    public isStageUnlocked(id: number, preRequisiteId: number | null): boolean {
        if (preRequisiteId === null) return true;
        return this.clearedStages.indexOf(preRequisiteId) !== -1;
    }

    public setStageCleared(id: number) {
        if (this.clearedStages.indexOf(id) === -1) {
            this.clearedStages.push(id);
        }
    }
}
