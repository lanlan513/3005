import { ButterflyCompanion, CompanionAbility } from '../types/game';

export const INITIAL_COMPANIONS: ButterflyCompanion[] = [
  {
    id: 'lumi',
    name: '露露',
    personality: 'curious',
    ability: 'light',
    description: '一只充满好奇心的小蝴蝶，她的光芒能照亮迷雾，让你看得更远。',
    color: '#FFD700',
    wingColor: '#FFA500',
    spotColor: '#FF6347',
    unlocked: false,
    x: 400,
    y: 1400,
    encounterCondition: '探索进度达到10%',
    encounterProgress: 0,
    encounterTarget: 10,
    abilityPower: 0.3,
    quote: '迷雾挡不住我好奇的眼睛~跟着我，我会为你照亮前路！',
  },
  {
    id: 'pathfinder',
    name: '小寻',
    personality: 'calm',
    ability: 'discover',
    description: '沉稳冷静的蝴蝶伙伴，对隐藏的道路有着敏锐的直觉。',
    color: '#7B68EE',
    wingColor: '#9370DB',
    spotColor: '#DDA0DD',
    unlocked: false,
    x: 1200,
    y: 800,
    encounterCondition: '收集5段记忆碎片',
    encounterProgress: 0,
    encounterTarget: 5,
    abilityPower: 0.4,
    quote: '每条隐藏的道路都有它的故事...让我帮你找到它们。',
  },
  {
    id: 'wisdom',
    name: '小智',
    personality: 'wise',
    ability: 'hint',
    description: '充满智慧的年长蝴蝶，能在你困惑时给予谜题的提示。',
    color: '#20B2AA',
    wingColor: '#48D1CC',
    spotColor: '#AFEEEE',
    unlocked: false,
    x: 1800,
    y: 1200,
    encounterCondition: '探索进度达到30%',
    encounterProgress: 0,
    encounterTarget: 30,
    abilityPower: 0.5,
    quote: '谜题的答案往往就在你眼前...只是需要换个角度看。',
  },
  {
    id: 'breeze',
    name: '小风',
    personality: 'playful',
    ability: 'light',
    description: '活泼好动的小蝴蝶，飞舞时带起的微风会驱散周围的迷雾。',
    color: '#87CEEB',
    wingColor: '#00BFFF',
    spotColor: '#E0FFFF',
    unlocked: false,
    x: 600,
    y: 400,
    encounterCondition: '解锁冲刺能力',
    encounterProgress: 0,
    encounterTarget: 1,
    abilityPower: 0.35,
    quote: '嘿嘿~我转圈圈的时候会有风哦！迷雾什么的一下子就散啦！',
  },
  {
    id: 'secret',
    name: '小秘',
    personality: 'shy',
    ability: 'discover',
    description: '害羞的小蝴蝶，虽然怕生但对隐藏的秘密有着天生的感知力。',
    color: '#FF69B4',
    wingColor: '#FFB6C1',
    spotColor: '#FFF0F5',
    unlocked: false,
    x: 2000,
    y: 500,
    encounterCondition: '解锁滑翔能力',
    encounterProgress: 0,
    encounterTarget: 1,
    abilityPower: 0.45,
    quote: '......我、我知道那边好像有什么...你、你可以去看看吗...',
  },
];

export const getCompanionAbilityBonus = (
  ability: CompanionAbility,
  abilityPower: number
): number => {
  return 1 + abilityPower;
};

export const getCompanionVisibilityBonus = (companion: ButterflyCompanion | null): number => {
  if (!companion || companion.ability !== 'light') return 1;
  return 1 + companion.abilityPower;
};

export const getCompanionDiscoveryBonus = (companion: ButterflyCompanion | null): number => {
  if (!companion || companion.ability !== 'discover') return 1;
  return 1 + companion.abilityPower;
};

export const getCompanionHintBonus = (companion: ButterflyCompanion | null): number => {
  if (!companion || companion.ability !== 'hint') return 0;
  return companion.abilityPower;
};

export const checkCompanionEncounter = (
  companion: ButterflyCompanion,
  collectedCount: number,
  explorationProgress: number,
  abilities: { id: string; unlocked: boolean }[]
): boolean => {
  if (companion.unlocked) return false;

  const condition = companion.encounterCondition;

  if (condition.startsWith('探索进度达到')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const progress = parseInt(match[1]);
      return explorationProgress >= progress;
    }
  }

  if (condition.startsWith('收集')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const count = parseInt(match[1]);
      return collectedCount >= count;
    }
  }

  if (condition.startsWith('解锁冲刺能力')) {
    const dashAbility = abilities.find(a => a.id === 'dash');
    return dashAbility?.unlocked || false;
  }

  if (condition.startsWith('解锁滑翔能力')) {
    const glideAbility = abilities.find(a => a.id === 'glide');
    return glideAbility?.unlocked || false;
  }

  return false;
};

export const getCompanionEncounterProgress = (
  companion: ButterflyCompanion,
  collectedCount: number,
  explorationProgress: number,
  abilities: { id: string; unlocked: boolean }[]
): number => {
  const condition = companion.encounterCondition;

  if (condition.startsWith('探索进度达到')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const target = parseInt(match[1]);
      return Math.min(100, (explorationProgress / target) * 100);
    }
  }

  if (condition.startsWith('收集')) {
    const match = condition.match(/(\d+)/);
    if (match) {
      const target = parseInt(match[1]);
      return Math.min(100, (collectedCount / target) * 100);
    }
  }

  if (condition.startsWith('解锁冲刺能力') || condition.startsWith('解锁滑翔能力')) {
    const abilityId = condition.includes('冲刺') ? 'dash' : 'glide';
    const ability = abilities.find(a => a.id === abilityId);
    return ability?.unlocked ? 100 : 0;
  }

  return 0;
};
