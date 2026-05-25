import { _decorator, Component, Label, Node, Button, director, ProgressBar } from 'cc';
import { SceneName } from '../Core/Constant';

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
    public selectionSlots: Node[] = []; // 6 slots for selection

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

        // Optionally, you can listen to global events here if you refactor Gold/Wave/HP 
        // to be updated via this Master HUD script instead of their individual scripts.
        // director.getScene().on(GlobalEvent.HP_CHANGED, this.updateHP, this);
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
            // Pause the game (if using director.pause or setting timeScale to 0)
            director.pause(); 
        }
    }

    public onResumeClicked() {
        if (this.optionMenuPanel) {
            this.optionMenuPanel.active = false;
            // Resume the game
            director.resume();
        }
    }

    public onExitClicked() {
        // Show confirmation before actually exiting
        if (this.confirmExitPanel) {
            this.confirmExitPanel.active = true;
        }
    }

    public onConfirmExitYes() {
        // User confirmed to exit. Restart or go to Landing Page
        director.resume(); // make sure to resume before changing scene
        director.loadScene(SceneName.LANDING_PAGE); 
    }

    public onConfirmExitNo() {
        // User canceled exit
        if (this.confirmExitPanel) {
            this.confirmExitPanel.active = false;
        }
    }

    public onSkipClicked() {
        // Logic to skip wave preparation
        // If WaveManager listens to a specific event, emit it here
        // director.getScene().emit("SKIP_WAVE");
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

    // This method can be called to highlight a selection slot
    public selectSlot(index: number) {
        for (let i = 0; i < this.selectionSlots.length; i++) {
            const slot = this.selectionSlots[i];
            if (slot) {
                // Example: enable a highlight child node, or change color
                // slot.getChildByName('Highlight').active = (i === index);
            }
        }
    }
}
