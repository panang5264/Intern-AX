export enum GlobalEvent {
    ENEMY_REMOVED = "ENEMY_REMOVED",
    ENABLE_SKIP = "ENABLE_SKIP",
    TOWER_DROPPED = "TOWER_DROPPED",
    TOWER_SELLED = "",
    SHOW_NOTI = "SHOW_NOTIFICATION",
    GOLD_CHANGED = "GOLD_CHANGED",
    TOWER_UPGRADE = "TOWER_UPGRADE"
}

export enum WaveState {
    START = "WAVE_STARTED",
    REST = "WAVE_RESTING",
}

export enum SceneName {
    LOGIN = "login",
    REGISTER = "register",
    LANDING_PAGE = "landing_page",
    MAINMENU = "main_menu",
    MAP = "Maps",
}

(window as any).GlobalEvent = GlobalEvent;
(window as any).WaveState = WaveState;


