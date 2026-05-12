export enum DamageType {
    PHYSICAL,
    MAGIC,
    HOLY
}

export enum EnemyType {
    NEUTRAL,
    UNDEAD,
    LICH_KING
}

export const WeaknessTable = {
    [EnemyType.NEUTRAL]: { [DamageType.PHYSICAL]: 1.0, [DamageType.MAGIC]: 1.0, [DamageType.HOLY]: 0.5 },
    [EnemyType.UNDEAD]: { [DamageType.PHYSICAL]: 0.9, [DamageType.MAGIC]: 1.2, [DamageType.HOLY]: 1.2 },
    [EnemyType.LICH_KING]: { [DamageType.PHYSICAL]: 1.05, [DamageType.MAGIC]: 0.25, [DamageType.HOLY]: 0.75 },
};
