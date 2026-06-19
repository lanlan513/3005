import { ButterflyAbility, HiddenArea, AbilityLevel } from '../types/game';

export const INITIAL_ABILITIES: ButterflyAbility[] = [
  {
    id: 'speed',
    name: '飞行速度',
    description: '蝴蝶的基础飞行速度',
    unlocked: true,
    unlockCondition: '',
    icon: '💨',
    level: 1,
    maxLevel: 5,
  },
  {
    id: 'visibility',
    name: '探索视野',
    description: '能够看清的迷雾范围',
    unlocked: true,
    unlockCondition: '',
    icon: '👁️',
    level: 1,
    maxLevel: 5,
  },
  {
    id: 'dash',
    name: '极速冲刺',
    description: '按下空格键进行短距离快速冲刺',
    unlocked: false,
    unlockCondition: '收集3段记忆碎片',
    icon: '⚡',
    level: 0,
    maxLevel: 3,
  },
  {
    id: 'glide',
    name: '滑翔能力',
    description: '按住Shift键进行滑翔，消耗更少能量飞得更远',
    unlocked: false,
    unlockCondition: '探索进度达到40%',
    icon: '🪂',
    level: 0,
    maxLevel: 3,
  },
];

export const INITIAL_HIDDEN_AREAS: HiddenArea[] = [
  {
    id: 'hidden-sky-garden',
    name: '天空花园',
    x: 100,
    y: 100,
    width: 300,
    height: 250,
    requiredAbility: 'dash',
    discovered: false,
    color: '#FFD700',
    description: '传说中只有最快的蝴蝶才能到达的神秘花园',
  },
  {
    id: 'hidden-deep-valley',
    name: '幽谷秘境',
    x: 2000,
    y: 1400,
    width: 350,
    height: 300,
    requiredAbility: 'glide',
    discovered: false,
    color: '#9370DB',
    description: '隐藏在深谷中的秘密之地，需要滑翔才能进入',
  },
  {
    id: 'hidden-crystal-cave',
    name: '水晶洞穴',
    x: 1050,
    y: 650,
    width: 300,
    height: 200,
    requiredAbility: 'visibility',
    discovered: false,
    color: '#87CEEB',
    description: '被迷雾笼罩的水晶洞穴，需要足够的视野才能发现',
  },
];

export const getAbilityLevelStats = (
  speedLevel: number,
  visibilityLevel: number,
  dashLevel: number,
  glideLevel: number
): AbilityLevel => {
  return {
    speedMultiplier: 1 + (speedLevel - 1) * 0.25,
    visibilityMultiplier: 1 + (visibilityLevel - 1) * 0.3,
    dashPower: 1 + dashLevel * 0.3,
    glideEfficiency: 0.5 + glideLevel * 0.15,
  };
};

export const checkAbilityUnlock = (
  ability: ButterflyAbility,
  collectedCount: number,
  explorationProgress: number
): boolean => {
  if (ability.unlocked) return true;

  const condition = ability.unlockCondition;

  if (condition.startsWith('收集')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const count = parseInt(match[1]);
      return collectedCount >= count;
    }
  }

  if (condition.startsWith('探索进度达到')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const progress = parseInt(match[1]);
      return explorationProgress >= progress;
    }
  }

  return false;
};

export const getSpeedLevelByFragments = (collectedCount: number): number => {
  if (collectedCount >= 10) return 5;
  if (collectedCount >= 7) return 4;
  if (collectedCount >= 5) return 3;
  if (collectedCount >= 3) return 2;
  return 1;
};

export const getVisibilityLevelByExploration = (explorationProgress: number): number => {
  if (explorationProgress >= 80) return 5;
  if (explorationProgress >= 60) return 4;
  if (explorationProgress >= 40) return 3;
  if (explorationProgress >= 20) return 2;
  return 1;
};

export const getDashLevelByFragments = (collectedCount: number): number => {
  if (collectedCount >= 8) return 3;
  if (collectedCount >= 6) return 2;
  if (collectedCount >= 3) return 1;
  return 0;
};

export const getGlideLevelByExploration = (explorationProgress: number): number => {
  if (explorationProgress >= 70) return 3;
  if (explorationProgress >= 55) return 2;
  if (explorationProgress >= 40) return 1;
  return 0;
};
