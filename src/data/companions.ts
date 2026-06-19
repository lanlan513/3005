import { ButterflyCompanion, CompanionAbility, HintInfo, HintType, Fragment, Flower, HiddenArea } from '../types/game';

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
    encounterCooldownUntil: 0,
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
    encounterCooldownUntil: 0,
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
    encounterCooldownUntil: 0,
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
    encounterCooldownUntil: 0,
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
    encounterCooldownUntil: 0,
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

const getDirectionName = (angle: number): string => {
  const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const sector = Math.round(normalized / (Math.PI / 4));
  const directions = ['东', '东南', '南', '西南', '西', '西北', '北', '东北'];
  return directions[sector % 8];
};

const hintTexts: Record<HintType, string[]> = {
  fragment: [
    '我感觉到附近有记忆碎片在闪烁~',
    '那边好像有记忆碎片的气息...',
    '快看！有记忆碎片在那个方向！',
    '如果你寻找记忆碎片的话，往那边走就对了~',
  ],
  flower: [
    '附近有一朵美丽的花在等你发现~',
    '花香从那个方向飘过来了...',
    '我嗅到了花朵的气息！',
    '好像有一朵特别的花在那边哦~',
  ],
  hidden: [
    '那里似乎藏着什么秘密...',
    '隐藏的区域就在那个方向！',
    '我感应到了不寻常的气息...',
    '那个地方很特别，值得去看看~',
  ],
  companion: [
    '有一只蝴蝶伙伴在附近...',
    '那个方向有我们的同类~',
    '我感觉到了另一只蝴蝶的存在！',
    '快去看看，有新伙伴在等你~',
  ],
};

export const generateHint = (
  playerX: number,
  playerY: number,
  fragments: Fragment[],
  flowers: Flower[],
  hiddenAreas: HiddenArea[],
  companions: ButterflyCompanion[]
): HintInfo | null => {
  const candidates: { type: HintType; id: string; name: string; x: number; y: number }[] = [];

  for (const fragment of fragments) {
    if (!fragment.collected) {
      candidates.push({
        type: 'fragment',
        id: fragment.id,
        name: '记忆碎片',
        x: fragment.x,
        y: fragment.y,
      });
    }
  }

  for (const flower of flowers) {
    if (flower.type === 'decorative') continue;
    if (flower.unlocked && !flower.discovered) {
      candidates.push({
        type: 'flower',
        id: flower.id,
        name: flower.name,
        x: flower.x,
        y: flower.y,
      });
    }
  }

  for (const area of hiddenAreas) {
    if (!area.discovered) {
      candidates.push({
        type: 'hidden',
        id: area.id,
        name: area.name,
        x: area.x + area.width / 2,
        y: area.y + area.height / 2,
      });
    }
  }

  for (const companion of companions) {
    if (!companion.unlocked) {
      candidates.push({
        type: 'companion',
        id: companion.id,
        name: `${companion.name}（蝴蝶伙伴）`,
        x: companion.x,
        y: companion.y,
      });
    }
  }

  if (candidates.length === 0) return null;

  let nearest = candidates[0];
  let minDist = Infinity;

  for (const candidate of candidates) {
    const dx = candidate.x - playerX;
    const dy = candidate.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = candidate;
    }
  }

  const dx = nearest.x - playerX;
  const dy = nearest.y - playerY;
  const angle = Math.atan2(dy, dx);
  const direction = getDirectionName(angle);
  const distance = Math.round(minDist);

  const texts = hintTexts[nearest.type];
  const hintText = texts[Math.floor(Math.random() * texts.length)];

  return {
    type: nearest.type,
    targetId: nearest.id,
    targetName: nearest.name,
    direction,
    distance,
    hintText,
  };
};

export const formatHintMessage = (hint: HintInfo): string => {
  if (hint.distance < 100) {
    return `${hint.hintText}\n\n目标「${hint.targetName}」就在附近！`;
  } else if (hint.distance < 300) {
    return `${hint.hintText}\n\n目标「${hint.targetName}」在${hint.direction}方向，大约${hint.distance}步远~`;
  } else {
    return `${hint.hintText}\n\n目标「${hint.targetName}」在${hint.direction}方向，还有一段路要走呢~`;
  }
};
