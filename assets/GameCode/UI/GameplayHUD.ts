import { _decorator, Component, Label, Node, Button, director, ProgressBar, Sprite, SpriteFrame } from 'cc';
import { SceneName } from '../Core/Constant';
import { TowerDragHandler } from '../Towers/TowerDrageHandler';
import { TowerController } from '../Towers/TowerController';
import { TowerType } from '../Core/GameConfig';
import { TowerLoadoutManager } from '../Core/TowerLoadoutManager';
import { TowerUpgrade } from '../Towers/TowerUpgrade';

const { ccclass, property } = _decorator;

@ccclass('GameplayHUD')
export class GameplayHUD extends Component {
    /** Singleton — TowerSelector เรียกผ่านตัวนี้ */
    public static instance: GameplayHUD = null;

    /** ป้อมที่กำลัง selected อยู่บนแผนที่ */
    private _selectedTowerNode: Node = null;
    private _selectedTowerUpgrade: TowerUpgrade = null;
    private _currentSelectedIndex: number = -1;
    @property(Label)
    public goldLabel: Label = null;

    @property(Label)
    public waveLabel: Label = null;

    @property(ProgressBar)
    public hpProgressBar: ProgressBar = null;

    @property(Label)
    public hpLabel: Label = null; // Option to show text like 100/100

    @property([Node])
    public selectionSlots: Node[] = []; // Slots for tower selection (configured under Bottomhud)

    // --- Info Panel UI Nodes ---
    @property(Node)
    public infoPanel: Node = null;

    @property(Sprite)
    public infoIcon: Sprite = null;

    @property(Label)
    public infoNameLabel: Label = null;

    @property(Label)
    public infoAtkLabel: Label = null;   // "ATK" header
    @property(Label)
    public infoAtkValue: Label = null;   // ตัวเลข เช่น "10"

    @property(Label)
    public infoSpdLabel: Label = null;   // "SPD" / "BUFF" / "GEN"
    @property(Label)
    public infoSpdValue: Label = null;   // ตัวเลข

    @property(Label)
    public infoRngLabel: Label = null;   // "RNG" / "INT"
    @property(Label)
    public infoRngValue: Label = null;   // ตัวเลข

    @property(Label)
    public infoTypeLabel: Label = null;  // "TYPE"
    @property(Label)
    public infoTypeValue: Label = null;  // "Single" / "Area" / "Gold" / "Buff"

    @property(Label)
    public infoCostLabel: Label = null; // Upgrade or buy cost label on the button

    // --- Slot Title Label (ชื่อป้อมที่แสดงบน InfoPanel / Frame2 > InfoPanel > TowerName) ---
    @property(Label)
    public slotTitleLabel: Label = null;

    // --- Upgrade Button ใน InfoPanel (Frame2 > InfoPanel > UpgradeBtn) ---
    @property(Button)
    public upgradePanelBtn: Button = null;

    @property(Button)
    public skipButton: Button = null;

    @property(Button)
    public optionButton: Button = null;

    @property(Node)
    public optionMenuPanel: Node = null; // The panel containing Resume, Exit

    @property(Node)
    public confirmExitPanel: Node = null; // The warning dialog "ถ้าออกต้องเริ่มเล่นด่านนี้ใหม่หมดนะ"

    protected onLoad() {
        GameplayHUD.instance = this;
        // Initialize UI states
        if (this.optionMenuPanel) this.optionMenuPanel.active = false;
        if (this.confirmExitPanel) this.confirmExitPanel.active = false;

        // ซ่อน Info Panel ตอนเริ่มเกม (จนกว่าจะมีการเลือกป้อม)
        if (this.infoPanel) this.infoPanel.active = false;

        // ดึงทีมป้อมปืนที่เซ็ตไว้จาก TowerLoadoutManager (Loadout) มาใส่ใน Slots อัตโนมัติ
        try {
            const equippedTowers = TowerLoadoutManager.instance.getEquippedTowers();
            for (let i = 0; i < this.selectionSlots.length; i++) {
                const slot = this.selectionSlots[i];
                const towerData = equippedTowers[i];
                if (slot && towerData) {
                    const dragHandler = slot.getComponent(TowerDragHandler) || slot.getComponent('TowerDragHandler') as TowerDragHandler;
                    if (dragHandler && towerData.prefab) {
                        // ปรับแต่งปุ่มสล็อตป้อมตาม Loadout
                        dragHandler.towerPrefab = towerData.prefab;
                        if (towerData.name) {
                            dragHandler.towerName = towerData.name;
                        }
                        if (towerData.cost > 0) {
                            dragHandler.towerCost = towerData.cost;
                        }
                        if (towerData.type !== undefined) {
                            dragHandler.towerType = towerData.type;
                        }

                        // อัปเดต Sprite รูปของสล็อตให้เป็นไปตามข้อมูลไอคอนป้อมใน Loadout (ถ้ามีรูปผูกอยู่)
                        const sprite = slot.getComponent(Sprite) || slot.getComponentInChildren(Sprite);
                        if (sprite && towerData.icon) {
                            sprite.spriteFrame = towerData.icon;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[GameplayHUD] ไม่สามารถโหลดข้อมูล Dynamic Loadout ได้ จะใช้การตั้งค่าเดิมใน Editor แทน", e);
        }
        for (let i = 0; i < this.selectionSlots.length; i++) {
            const slot = this.selectionSlots[i];
            if (!slot) continue;
            const data = slot.getComponent(TowerDragHandler);
            if (!data) continue;
            const titleNode = slot.getChildByName('titletower');
            if (titleNode) {
                const label = titleNode.getComponent(Label);
                if (label) label.string = data.towerName;
            }
            // อัปเดต Costlabel ใน Slot
            const costNode = slot.getChildByName('Costlabel');
            if (costNode) {
                const label = costNode.getComponent(Label);
                if (label) label.string = `${data.towerCost} G`;
            }
        }
    }

    protected onDestroy() {
        // director.getScene().off(GlobalEvent.HP_CHANGED, this.updateHP, this);
    }

    // ==================
    // Button Callbacks
    // ==================

    public onOptionClicked() {
        if (this.optionMenuPanel) {
            this.optionMenuPanel.active = true;
            director.pause();
        }
    }

    public onResumeClicked() {
        if (this.optionMenuPanel) {
            this.optionMenuPanel.active = false;
            director.resume();
        }
    }

    public onExitClicked() {
        if (this.confirmExitPanel) {
            this.confirmExitPanel.active = true;
        }
    }

    public onConfirmExitYes() {
        director.resume();
        director.loadScene(SceneName.LANDING_PAGE);
    }

    public onConfirmExitNo() {
        if (this.confirmExitPanel) {
            this.confirmExitPanel.active = false;
        }
    }

    public onSkipClicked() {
        console.log("Skip button clicked");
    }

    // ==================
    // UI Update Methods
    // ==================

    public updateHP(currentHP: number, maxHP: number) {
        if (this.hpProgressBar) {
            this.hpProgressBar.progress = currentHP / maxHP;
        }
        if (this.hpLabel) {
            this.hpLabel.string = `${currentHP} / ${maxHP}`;
        }
    }

    public selectSlot(index: number) {
        // 1. ควบคุมกรอบไฮไลต์สีเหลืองของสล็อต
        for (let i = 0; i < this.selectionSlots.length; i++) {
            const slot = this.selectionSlots[i];
            if (slot) {
                const highlight = slot.getChildByName('Highlight') || slot.getChildByName('highlight');
                if (highlight) {
                    highlight.active = (i === index);
                }
            }
        }

        // 2. ดึงข้อมูลป้อมแบบไดนามิกจาก Slot ที่เลือก
        if (index >= 0 && index < this.selectionSlots.length) {
            const slot = this.selectionSlots[index];
            if (!slot) return;

            // ดึงสคริปต์ TowerDragHandler จากสล็อต
            const dragHandler = slot.getComponent(TowerDragHandler) || slot.getComponent('TowerDragHandler') as TowerDragHandler;
            if (dragHandler && dragHandler.towerPrefab) {
                // ดึงข้อมูล Sprite Frame ของสล็อตมาใช้เป็น Icon ใน Info Panel
                const iconChild = slot.getChildByName('Icon');
                const slotSprite = iconChild
                    ? iconChild.getComponent(Sprite)
                    : slot.getComponent(Sprite);
                const spriteFrame = slotSprite ? slotSprite.spriteFrame : null;

                // ดึง Root Node ของ Prefab ป้อมเพื่อเช็คคุณสมบัติ/สเตตัสดั้งเดิม (Stats)
                const prefabNode = dragHandler.towerPrefab.data;
                const controller = prefabNode ? (prefabNode.getComponent(TowerController) || prefabNode.getComponent('TowerController') as TowerController) : null;

                if (controller) {
                    const nameStr = controller.towerName || dragHandler.towerName;
                    const costStr = `${dragHandler.towerCost || controller.cost} G`;

                    let atkStr = `ATK -`;
                    let spdStr = `SPD -`;
                    let rngStr = `RNG -`;
                    let typeStr = `TYPE -`;

                    if (controller.type === TowerType.ATTACK_TOWER) {
                        atkStr = `${controller.damage}`;
                        spdStr = `${(1.0 / controller.attackCooldown).toFixed(2)}`;
                        rngStr = `${controller.towerRange}`;
                        typeStr = `${controller.isSplash ? "Area" : "Single"}`;
                        if (this.infoAtkLabel) { this.infoAtkLabel.string = "ATK"; this.infoAtkLabel.node.active = true; }
                        if (this.infoSpdLabel) this.infoSpdLabel.string = "SPD";
                        if (this.infoRngLabel) this.infoRngLabel.string = "RNG";
                    } else if (controller.type === TowerType.SUPPORT) {
                        atkStr = ``;
                        spdStr = `+${controller.buffEff}`;
                        rngStr = `${controller.towerRange}`;
                        typeStr = `Buff`;
                        if (this.infoAtkLabel) this.infoAtkLabel.node.active = false;
                        if (this.infoSpdLabel) this.infoSpdLabel.string = "BUFF";
                        if (this.infoRngLabel) this.infoRngLabel.string = "RNG";
                    } else if (controller.type === TowerType.GOLDMINE) {
                        atkStr = ``;
                        spdStr = `+${controller.goldGenerated}`;
                        rngStr = `${controller.generationInterval}s`;
                        typeStr = `Gold`;
                        if (this.infoAtkLabel) this.infoAtkLabel.node.active = false;
                        if (this.infoSpdLabel) this.infoSpdLabel.string = "GEN";
                        if (this.infoRngLabel) this.infoRngLabel.string = "INT";
                    }
                    if (this.infoTypeLabel) this.infoTypeLabel.string = "TYPE";
                    // ซ่อน/แสดง AtkLabel ตาม type
                    if (this.infoAtkLabel) {
                        this.infoAtkLabel.node.active = controller.type === TowerType.ATTACK_TOWER;
                    }

                    this.updateTowerDetails(nameStr, atkStr, spdStr, rngStr, typeStr, costStr, spriteFrame);
                } else {
                    // Fallback หากไม่มี controller
                    const nameStr = dragHandler.towerName;
                    const costStr = `↑ ${dragHandler.towerCost} G`;
                    const typeStr = `TYPE ${dragHandler.towerType}`;
                    this.updateTowerDetails(nameStr, `ATK -`, `SPD -`, `RNG -`, typeStr, costStr, spriteFrame);
                }
            }
        }
    }

    /**
     * Callback สำหรับผูกปุ่มสล็อตป้อมใน Editor
     * รองรับทั้งการส่ง Event และระบุ Index ผ่าน Custom Event Data
     * หรือส่ง Node ของ Slot เข้ามาตรงๆ (ตามโค้ดตัวอย่างของผู้ใช้)
     */
    public onSlotClicked(event: Event, customData: string) {
        const index = parseInt(customData)
        this._currentSelectedIndex = index;

        // รีเซ็ตทุก slot
        for (let i = 0; i < this.selectionSlots.length; i++) {
            const slot = this.selectionSlots[i]
            if (!slot) continue;

            const highlight = slot.getChildByName('Highlight') || slot.getChildByName('highlight')
            if (highlight) {
                highlight.active = false
            }

            const iconNode = slot.getChildByName('Icon') || slot
            const icon = iconNode.getComponent(Sprite) || iconNode.getComponentInChildren(Sprite)
            if (icon) {
                icon.grayscale = true  // ทำให้มืดลง
            }
        }

        // เปิด slot ที่เลือก
        if (index >= 0 && index < this.selectionSlots.length) {
            const selected = this.selectionSlots[index]
            if (selected) {
                const highlight = selected.getChildByName('Highlight') || selected.getChildByName('highlight')
                if (highlight) {
                    highlight.active = true
                }

                const iconNode = selected.getChildByName('Icon') || selected
                const selectedIcon = iconNode.getComponent(Sprite) || iconNode.getComponentInChildren(Sprite)
                if (selectedIcon) {
                    selectedIcon.grayscale = false  // สว่างขึ้น
                }

                // เรียกฟังก์ชัน selectSlot เพื่อคำนวณและดึงภาพไอคอน รวมถึงข้อมูลสเตตัส (ATK, SPD, RNG, TYPE)
                // จากตัว Prefab ป้อมปืนมาแสดงบนหน้าต่างรายละเอียด (Info Panel) โดยอัตโนมัติ
                this.selectSlot(index);
            }
        }
    }

    // ==================
    // Placed Tower Info (คลิกป้อมที่วางบนแผนที่)
    // ==================

    /**
     * เรียกจาก TowerSelector เมื่อผู้เล่นคลิกป้อมที่วางบนแผนที่
     * แสดงข้อมูลสถานะ + ราคา Upgrade จริงจาก TowerUpgrade
     */
    public showPlacedTowerInfo(towerNode: Node): void {
        this._selectedTowerNode = towerNode;

        const ctrl = towerNode.getComponent(TowerController) as TowerController;
        const upgrade = towerNode.getComponent(TowerUpgrade) as TowerUpgrade;
        this._selectedTowerUpgrade = upgrade || null;

        if (!ctrl) return;

        // ดึง stats จาก TowerController
        const nameStr = ctrl.towerName;
        let atkStr = `ATK -`, spdStr = `SPD -`, rngStr = `RNG -`, typeStr = `TYPE -`;

        if (ctrl.type === TowerType.ATTACK_TOWER) {
            atkStr = `${ctrl.damage}`;
            spdStr = `${(1.0 / ctrl.attackCooldown).toFixed(2)}`;
            rngStr = `${ctrl.towerRange}`;
            typeStr = `${ctrl.isSplash ? 'Area' : 'Single'}`;
            if (this.infoAtkLabel) { this.infoAtkLabel.string = "ATK"; this.infoAtkLabel.node.active = true; }
            if (this.infoSpdLabel) this.infoSpdLabel.string = "SPD";
            if (this.infoRngLabel) this.infoRngLabel.string = "RNG";
        } else if (ctrl.type === TowerType.SUPPORT) {
            atkStr = ``;
            spdStr = `+${ctrl.buffEff}`;
            rngStr = `${ctrl.towerRange}`;
            typeStr = `Buff`;
            if (this.infoAtkLabel) this.infoAtkLabel.node.active = false;
            if (this.infoSpdLabel) this.infoSpdLabel.string = "BUFF";
            if (this.infoRngLabel) this.infoRngLabel.string = "RNG";
        } else if (ctrl.type === TowerType.GOLDMINE) {
            atkStr = ``;
            spdStr = `+${ctrl.goldGenerated}`;
            rngStr = `${ctrl.generationInterval}s`;
            typeStr = `Gold`;
            if (this.infoAtkLabel) this.infoAtkLabel.node.active = false;
            if (this.infoSpdLabel) this.infoSpdLabel.string = "GEN";
            if (this.infoRngLabel) this.infoRngLabel.string = "INT";
        }
        if (this.infoTypeLabel) this.infoTypeLabel.string = "TYPE";
        // ซ่อน/แสดง AtkLabel ตาม type
        if (this.infoAtkLabel) {
            this.infoAtkLabel.node.active = ctrl.type === TowerType.ATTACK_TOWER;
        }

        // ดึงราคา Upgrade Tier ถัดไปจาก TowerUpgrade
        const tierCost = upgrade && upgrade.cur_data ? upgrade.cur_data.price : 0;
        const tierStr = upgrade && upgrade.max_upgrade
            ? `Max`
            : `↑ ${tierCost} G`;

        this.updateTowerDetails(nameStr, atkStr, spdStr, rngStr, typeStr, tierStr, null, tierCost);
    }

    /**
     * ซ่อน InfoPanel เมื่อป้อมที่ selected ถูกลบออก (ขาย / destroy)
     */
    public hidePlacedTowerInfo(): void {
        this._selectedTowerNode = null;
        this._selectedTowerUpgrade = null;
        if (this.infoPanel) this.infoPanel.active = false;
    }

    /**
     * ผูกปุ่ม UpgradeBtn บน InfoPanel ใน Editor → Component GameplayHUD → Method นี้
     * กดแล้วจะ Upgrade ป้อมที่ selected อยู่จริง ๆ
     */
    public onUpgradePanelBtnClicked(): void {
        if (!this._selectedTowerUpgrade) return;
        if (this._selectedTowerUpgrade.max_upgrade) return;
        // เรียก upgrade() ของเพื่อน — ไม่ต้องส่ง event/data เพราะมันไม่ใช้
        this._selectedTowerUpgrade.upgrade(null, null);
        // รีเฟรช InfoPanel หลัง upgrade
        if (this._selectedTowerNode) {
            this.showPlacedTowerInfo(this._selectedTowerNode);
        }
    }

    /**
     * Helper method ในการอัปเดตข้อมูลรายละเอียดป้อมไปยัง UI Nodes
     * รวมถึง slotTitleLabel (TowerName) และ UpgradeBtn บน InfoPanel
     */
    private updateTowerDetails(
        name: string,
        atk: string,
        spd: string,
        rng: string,
        type: string,
        cost: string,
        spriteFrame: SpriteFrame | null,
        upgradeCost: number = 0
    ) {
        if (this.infoPanel) this.infoPanel.active = true;

        if (spriteFrame && this.infoIcon) {
            this.infoIcon.spriteFrame = spriteFrame;
        }

        // ✅ ตรงนี้คือที่ที่ slotTitleLabel.string = name ทำงาน
        // ผูกกับ TowerName Label บน Frame2 > InfoPanel


        const updates = [
            { label: this.infoNameLabel, val: name },
            { label: this.infoAtkValue, val: atk },
            { label: this.infoSpdValue, val: spd },
            { label: this.infoRngValue, val: rng },
            { label: this.infoTypeValue, val: type },
            { label: this.infoCostLabel, val: cost },
        ];

        for (const update of updates) {
            if (update.label) {
                update.label.string = update.val;
            }
        }

        // อัปเดต Costlabel ใน Slot ที่เลือกอยู่
        if (this._currentSelectedIndex >= 0) {
            const selectedSlot = this.selectionSlots[this._currentSelectedIndex];
            if (selectedSlot) {
                const costNode = selectedSlot.getChildByName('Costlabel');
                if (costNode) {
                    const lbl = costNode.getComponent(Label);
                    if (lbl) lbl.string = cost;
                }
            }
        }

        // ✅ อัปเดต UpgradeBtn — แสดงราคาอัพเกรด Tier ถัดไป
        if (this.upgradePanelBtn) {
            const btnLabel = this.upgradePanelBtn.node.getComponentInChildren(Label);
            if (btnLabel) {
                if (upgradeCost > 0) {
                    btnLabel.string = `Upgrade ${upgradeCost} G`;
                    this.upgradePanelBtn.node.active = true;
                } else {
                    btnLabel.string = `Max Upgrade`;
                    this.upgradePanelBtn.node.active = false;
                }
            }
        }
    }
}