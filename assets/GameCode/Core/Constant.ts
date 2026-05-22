enum GlobalEvent {
    ENEMY_REMOVED = "ENEMY_REMOVED",
    ENABLE_SKIP = "ENABLE_SKIP",
    TOWER_DROPPED = "TOWER_DROPPED",
    SHOW_NOTI = "SHOW_NOTIFICATION",
    GOLD_CHANGED = "GOLD_CHANGED",
}

enum WaveState {
    START = "WAVE_STARTED",
    REST = "WAVE_RESTING",
}

export enum SceneName {
    LOGIN = "login",
    REGISTER = "register",
    LANDING_PAGE = "landing_page",
    MAINMENU = "main_menu"
}

(window as any).GlobalEvent = GlobalEvent;
(window as any).WaveState = WaveState;


