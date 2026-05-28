import { _decorator, Component, Prefab, SpriteFrame } from 'cc';
import { TowerType } from './GameConfig';

const { ccclass, property } = _decorator;

export interface TowerData {
    id: string;
    name: string;
    cost: number;
    type: TowerType;
    prefab: Prefab | null;
    icon: SpriteFrame | null;
    description: string;
    isUnlocked: boolean;
}

@ccclass('TowerLoadoutManager')
export class TowerLoadoutManager {
    private static _instance: TowerLoadoutManager = null;
    public static get instance(): TowerLoadoutManager {
        if (!this._instance) {
            this._instance = new TowerLoadoutManager();
        }
        return this._instance;
    }

    // คลังป้อมปืนทั้งหมดในเกม (Collection)
    private _collection: TowerData[] = [];
    
    // ป้อมปืนที่ติดตั้งไว้สำหรับลงเล่น 5 ตัว (Loadout)
    private _equippedTowers: (TowerData | null)[] = [null, null, null, null, null];

    constructor() {
        this.initializeMockData();
    }

    /**
     * สร้าข้อมูลจำลองของคลังป้อม (Collection) และจัดทีมเริ่มแรก (Loadout)
     */
    private initializeMockData() {
        // รายการป้อมทั้งหมดในระบบ (Collection)
        this._collection = [
            {
                id: "archer",
                name: "Archer Tower",
                cost: 100,
                type: TowerType.ATTACK_TOWER,
                prefab: null,
                icon: null,
                description: "ยิงธนูด้วยความเร็วสูง เป้าหมายเดี่ยว",
                isUnlocked: true
            },
            {
                id: "cannon",
                name: "Cannon Tower",
                cost: 200,
                type: TowerType.ATTACK_TOWER,
                prefab: null,
                icon: null,
                description: "ยิงระเบิดดาเมจเป็นวงกว้าง (Splash Area)",
                isUnlocked: true
            },
            {
                id: "mage",
                name: "Mage Tower",
                cost: 175,
                type: TowerType.ATTACK_TOWER,
                prefab: null,
                icon: null,
                description: "ยิงลูกพลังเวทมนตร์ รุนแรงและทะลุเกราะ",
                isUnlocked: true
            },
            {
                id: "barracks",
                name: "Barracks",
                cost: 150,
                type: TowerType.ATTACK_TOWER,
                prefab: null,
                icon: null,
                description: "เรียกทหารออกมายืนสกัดกั้นศัตรูบนเส้นทาง",
                isUnlocked: true
            },
            {
                id: "frost",
                name: "Frost Tower",
                cost: 225,
                type: TowerType.ATTACK_TOWER,
                prefab: null,
                icon: null,
                description: "ยิงไอเย็นสโลว์ความเร็วเคลื่อนที่ของศัตรู",
                isUnlocked: false // ล็อคอยู่ ต้องกดปลดล็อคใน Collection
            },
            {
                id: "priest",
                name: "Priest Buff",
                cost: 120,
                type: TowerType.SUPPORT,
                prefab: null,
                icon: null,
                description: "บัฟเพิ่มความเร็วในการโจมตีให้ป้อมรอบข้าง",
                isUnlocked: true
            },
            {
                id: "goldmine",
                name: "Gold Mine",
                cost: 80,
                type: TowerType.GOLDMINE,
                prefab: null,
                icon: null,
                description: "ผลิตทองให้กับผู้เล่นทุกระยะเวลาที่กำหนด",
                isUnlocked: true
            }
        ];

        // ตั้งค่าสล็อต Loadout เริ่มแรก 5 ป้อมหลัก
        this._equippedTowers[0] = this.getTowerById("archer");
        this._equippedTowers[1] = this.getTowerById("cannon");
        this._equippedTowers[2] = this.getTowerById("mage");
        this._equippedTowers[3] = this.getTowerById("barracks");
        this._equippedTowers[4] = this.getTowerById("priest");
    }

    // ดึงป้อมทั้งหมดในระบบ (Collection)
    public getCollection(): TowerData[] {
        return this._collection;
    }

    // ดึงป้อมที่ถูกติดตั้งไว้ 5 ตัว (Loadout)
    public getEquippedTowers(): (TowerData | null)[] {
        return this._equippedTowers;
    }

    public getTowerById(id: string): TowerData | null {
        return this._collection.find(t => t.id === id) || null;
    }

    /**
     * ฟังก์ชันปลดล็อคป้อมใหม่ในคลัง (Collection)
     */
    public unlockTower(id: string): boolean {
        const tower = this.getTowerById(id);
        if (tower) {
            tower.isUnlocked = true;
            console.log(`[Collection] ปลดล็อคป้อม ${tower.name} สำเร็จ!`);
            return true;
        }
        return false;
    }

    /**
     * สลับเปลี่ยนป้อมในช่อง Loadout
     * @param slotIndex ดัชนีสล็อตปุ่ม 0-4
     * @param towerId ไอดีของป้อมในคลังที่ต้องการนำมาติดตั้ง
     */
    public equipTower(slotIndex: number, towerId: string): boolean {
        if (slotIndex < 0 || slotIndex >= 5) return false;

        const tower = this.getTowerById(towerId);
        if (!tower) {
            console.warn(`[Loadout] ไม่พบป้อมไอดี: ${towerId}`);
            return false;
        }

        if (!tower.isUnlocked) {
            console.warn(`[Loadout] ป้อม ${tower.name} ยังไม่ถูกปลดล็อค!`);
            return false;
        }

        // ตรวจสอบว่าป้อมตัวนี้ถูกสวมใส่อยู่ในช่องอื่นแล้วหรือยัง (ป้องกันใส่ซ้ำ)
        const alreadyEquippedIndex = this._equippedTowers.findIndex(t => t && t.id === towerId);
        if (alreadyEquippedIndex !== -1) {
            // สลับช่องกัน
            this._equippedTowers[alreadyEquippedIndex] = this._equippedTowers[slotIndex];
        }

        this._equippedTowers[slotIndex] = tower;
        console.log(`[Loadout] สวมใส่ป้อม ${tower.name} ในสล็อตที่ ${slotIndex + 1} สำเร็จ!`);
        return true;
    }
}
