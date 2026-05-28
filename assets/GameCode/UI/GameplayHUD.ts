import { _decorator, Component, Label, Node, Button, director, ProgressBar, Sprite, SpriteFrame } from 'cc';
import { SceneName } from '../Core/Constant';
import { TowerDragHandler } from '../Towers/TowerDrageHandler';
import { TowerController } from '../Towers/TowerController';
import { TowerType } from '../Core/GameConfig';
import { TowerLoadoutManager } from '../Core/TowerLoadoutManager';

const { ccclass, property } = _decorator;

@ccclass('GameplayHUD')
export class GameplayHUD extends Component {
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
    public infoAtkLabel: Label = null;

    @property(Label)
    public infoSpdLabel: Label = null;

    @property(Label)
    public infoRngLabel: Label = null;

    @property(Label)
    public infoTypeLabel: Label = null;

    @property(Label)
    public infoCostLabel: Label = null; // Upgrade or buy cost label on the button

    @property(Button)
    public skipButton: Button = null;

    @property(Button)
    public optionButton: Button = null;

    @property(Node)
    public optionMenuPanel: Node = null; // The panel containing Resume, Exit

    @property(Node)
    public confirmExitPanel: Node = null; // The warning dialog "ถ้าออกต้องเริ่มเล่นด่านนี้ใหม่หมดนะ"

    protected onLoad() {
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
                    if (dragHandler) {
                        // ปรับแต่งปุ่มสล็อตป้อมตาม Loadout
                        if (towerData.prefab) {
                            dragHandler.towerPrefab = towerData.prefab;
                        }
                        if (towerData.name) {
                            dragHandler.towerName = towerData.name;
                        }
                        if (towerData.cost > 0) {
                            dragHandler.towerCost = towerData.cost;
                        }
                        if (towerData.type !== undefined) {
                            dragHandler.towerType = towerData.type;
                        }
                    }

                    // อัปเดต Sprite รูปของสล็อตให้เป็นไปตามข้อมูลไอคอนป้อมใน Loadout (ถ้ามีรูปผูกอยู่)
                    const sprite = slot.getComponent(Sprite) || slot.getComponentInChildren(Sprite);
                    if (sprite && towerData.icon) {
                        sprite.spriteFrame = towerData.icon;
                    }
                }
            }
        } catch (e) {
            console.error("[GameplayHUD] ไม่สามารถโหลดข้อมูล Dynamic Loadout ได้ จะใช้การตั้งค่าเดิมใน Editor แทน", e);
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

    /**
     * ฟังก์ชันสำหรับการเลือก Slot ป้อมแบบไดนามิก
     * ดึงข้อมูล Stats ทั้งหมดจาก TowerPrefab ที่ผูกอยู่กับ TowerDragHandler ของ Slot นั้นโดยตรง
     */
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
                const slotSprite = slot.getComponent(Sprite) || slot.getComponentInChildren(Sprite);
                if (this.infoIcon && slotSprite) {
                    this.infoIcon.spriteFrame = slotSprite.spriteFrame;
                }

                // ดึง Root Node ของ Prefab ป้อมเพื่อเช็คคุณสมบัติ/สเตตัสดั้งเดิม (Stats)
                const prefabNode = dragHandler.towerPrefab.data;
                const controller = prefabNode ? (prefabNode.getComponent(TowerController) || prefabNode.getComponent('TowerController') as TowerController) : null;

                if (controller) {
                    if (this.infoPanel) this.infoPanel.active = true;
                    if (this.infoNameLabel) this.infoNameLabel.string = controller.towerName || dragHandler.towerName;

                    // แสดงผลสเตตัสให้สอดคล้องกับประเภทป้อมโดยตรง
                    if (controller.type === TowerType.ATTACK_TOWER) {
                        if (this.infoAtkLabel) this.infoAtkLabel.string = `ATK ${controller.damage}`;
                        if (this.infoSpdLabel) this.infoSpdLabel.string = `SPD ${(1.0 / controller.attackCooldown).toFixed(2)}`;
                        if (this.infoRngLabel) this.infoRngLabel.string = `RNG ${controller.towerRange}`;
                        if (this.infoTypeLabel) this.infoTypeLabel.string = `TYPE ${controller.isSplash ? "Area" : "Single"}`;
                    } else if (controller.type === TowerType.SUPPORT) {
                        if (this.infoAtkLabel) this.infoAtkLabel.string = `ATK -`;
                        if (this.infoSpdLabel) this.infoSpdLabel.string = `BUFF +${controller.buffEff}`;
                        if (this.infoRngLabel) this.infoRngLabel.string = `RNG ${controller.towerRange}`;
                        if (this.infoTypeLabel) this.infoTypeLabel.string = `TYPE Buff`;
                    } else if (controller.type === TowerType.GOLDMINE) {
                        if (this.infoAtkLabel) this.infoAtkLabel.string = `ATK -`;
                        if (this.infoSpdLabel) this.infoSpdLabel.string = `GEN +${controller.goldGenerated}`;
                        if (this.infoRngLabel) this.infoRngLabel.string = `INT ${controller.generationInterval}s`;
                        if (this.infoTypeLabel) this.infoTypeLabel.string = `TYPE Gold`;
                    }

                    // แสดงราคาอัปเกรด/สร้าง (ดึงราคาดั้งเดิมจาก Prefab หรือ DragHandler)
                    if (this.infoCostLabel) {
                        this.infoCostLabel.string = `${dragHandler.towerCost || controller.cost} G`;
                    }
                }
            }
        }
    }

    /**
     * Callback สำหรับผูกปุ่มสล็อตป้อมใน Editor
     * เลือกส่ง Event และระบุ Index ผ่าน Custom Event Data
     */
    public onSlotClicked(event: any, customEventData: string) {
        const slotIndex = parseInt(customEventData);
        if (!isNaN(slotIndex)) {
            this.selectSlot(slotIndex);
            console.log(`[HUD] Selected Slot: ${slotIndex}`);
        }
    }
}
