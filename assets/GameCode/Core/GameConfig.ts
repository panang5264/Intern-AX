// assets/GameCode/CoreSystems/GameConfig.ts

export enum TowerType {
    ATTACK_TOWER,
    GOLDMINE,
    SUPPORT,
}
export enum DamageType {
    PHYSICAL,
    MAGIC,
    HOLY
}

export enum EnemyType {
    NEUTRAL,
    UNDEAD,
    LICH_KING,
    PLAGUE_KNIGHT,
    DARK_KNIGHT
}

export const WeaknessTable = {
    // Neutral
    [EnemyType.NEUTRAL]: {
        [DamageType.PHYSICAL]: 1.0,
        [DamageType.MAGIC]: 1.0,
        [DamageType.HOLY]: 0.5
    },

    // Undead 
    [EnemyType.UNDEAD]: {
        [DamageType.PHYSICAL]: 0.9,
        [DamageType.MAGIC]: 1.2,
        [DamageType.HOLY]: 1.2
    },

    // Lich King 
    [EnemyType.LICH_KING]: {
        [DamageType.PHYSICAL]: 1.05,
        [DamageType.MAGIC]: 0.45,
        [DamageType.HOLY]: 0.75
    },

    // Plague Knight 
    [EnemyType.PLAGUE_KNIGHT]: {
        [DamageType.PHYSICAL]: 0.85,
        [DamageType.MAGIC]: 1.25,
        [DamageType.HOLY]: 1.5
    },

    // Dark Knight 
    [EnemyType.DARK_KNIGHT]: {
        [DamageType.PHYSICAL]: 1.1,
        [DamageType.MAGIC]: 0.4,
        [DamageType.HOLY]: 0.7
    }
};
