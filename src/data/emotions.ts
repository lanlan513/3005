import { Emotion, EmotionCombination, EmotionHiddenArea, EmotionStory, EmotionType, EmotionCount } from '../types/game';

export const EMOTIONS: Record<EmotionType, Emotion> = {
  joy: {
    type: 'joy',
    name: '喜悦',
    color: '#FFD93D',
    glowColor: '#FFE66D',
    bgColor: '#FFF8DC',
    icon: '☀️',
    description: '温暖明亮的回忆，如阳光洒落心田',
    musicMood: 'upbeat',
  },
  regret: {
    type: 'regret',
    name: '遗憾',
    color: '#87CEEB',
    glowColor: '#ADD8E6',
    bgColor: '#E0F4FF',
    icon: '🌊',
    description: '那些未能说出口的话，未能完成的事',
    musicMood: 'melancholic',
  },
  courage: {
    type: 'courage',
    name: '勇气',
    color: '#FF6B6B',
    glowColor: '#FF8787',
    bgColor: '#FFE0E0',
    icon: '🔥',
    description: '跨越恐惧与困难时，心中燃起的火焰',
    musicMood: 'epic',
  },
  longing: {
    type: 'longing',
    name: '思念',
    color: '#9B7EDC',
    glowColor: '#B39DDB',
    bgColor: '#F0E6FF',
    icon: '🌙',
    description: '对远方之人、逝去时光的深深眷恋',
    musicMood: 'nostalgic',
  },
};

export const DEFAULT_MOOD_COLORS = {
  groundStart: '#A8E6CF',
  groundMid: '#88D8A8',
  groundEnd: '#6BC88A',
};

export const EMOTION_COMBINATIONS: EmotionCombination[] = [
  {
    id: 'combo-sunrise',
    name: '晨曦之境',
    requiredEmotions: { joy: 2, courage: 1 },
    minTotal: 3,
    description: '当喜悦与勇气交织，第一道晨光划破夜空，崭新的世界在眼前展开',
    unlocksHiddenAreaId: 'emotion-area-sunrise',
    unlocksStoryId: 'emotion-story-sunrise',
    colorTheme: '#FFD93D',
    musicMood: 'upbeat',
  },
  {
    id: 'combo-ocean',
    name: '深海追忆',
    requiredEmotions: { regret: 2, longing: 1 },
    minTotal: 3,
    description: '潜入记忆的深海，那些被时光掩埋的遗憾与思念如珍珠般闪耀',
    unlocksHiddenAreaId: 'emotion-area-ocean',
    unlocksStoryId: 'emotion-story-ocean',
    colorTheme: '#4DABF7',
    musicMood: 'melancholic',
  },
  {
    id: 'combo-phoenix',
    name: '凤凰涅槃',
    requiredEmotions: { courage: 2, regret: 1 },
    minTotal: 3,
    description: '在遗憾的灰烬中，勇气化作不灭的火焰，涅槃重生',
    unlocksHiddenAreaId: 'emotion-area-phoenix',
    unlocksStoryId: 'emotion-story-phoenix',
    colorTheme: '#FF6B6B',
    musicMood: 'epic',
  },
  {
    id: 'combo-starrynight',
    name: '星河相望',
    requiredEmotions: { longing: 2, joy: 1 },
    minTotal: 3,
    description: '思念如繁星满天，每一颗都承载着甜蜜的回忆',
    unlocksHiddenAreaId: 'emotion-area-starry',
    unlocksStoryId: 'emotion-story-starry',
    colorTheme: '#9B7EDC',
    musicMood: 'nostalgic',
  },
  {
    id: 'combo-rainbow',
    name: '彩虹之桥',
    requiredEmotions: { joy: 1, regret: 1, courage: 1, longing: 1 },
    minTotal: 4,
    description: '当所有情感汇聚，一座连接过去与未来的彩虹之桥显现',
    unlocksHiddenAreaId: 'emotion-area-rainbow',
    unlocksStoryId: 'emotion-story-rainbow',
    colorTheme: '#FF6B9D',
    musicMood: 'peaceful',
  },
  {
    id: 'combo-garden',
    name: '永恒花园',
    requiredEmotions: { joy: 2, longing: 2 },
    minTotal: 4,
    description: '喜悦与思念共同浇灌的秘密花园，花开不败，记忆永存',
    unlocksHiddenAreaId: 'emotion-area-garden',
    unlocksStoryId: 'emotion-story-garden',
    colorTheme: '#C084FC',
    musicMood: 'nostalgic',
  },
];

export const EMOTION_HIDDEN_AREAS: EmotionHiddenArea[] = [
  {
    id: 'emotion-area-sunrise',
    name: '晨曦之境',
    x: 2000,
    y: 50,
    width: 350,
    height: 350,
    discovered: false,
    description: '阳光普照的神秘高地',
    themeColor: '#FFD93D',
    decoration: 'aurora',
  },
  {
    id: 'emotion-area-ocean',
    name: '深海追忆',
    x: 50,
    y: 50,
    width: 350,
    height: 350,
    discovered: false,
    description: '波光粼粼的记忆之海',
    themeColor: '#87CEEB',
    decoration: 'ocean',
  },
  {
    id: 'emotion-area-phoenix',
    name: '凤凰涅槃',
    x: 2000,
    y: 1400,
    width: 350,
    height: 350,
    discovered: false,
    description: '烈焰燃烧的重生之地',
    themeColor: '#FF6B6B',
    decoration: 'ember',
  },
  {
    id: 'emotion-area-starry',
    name: '星河相望',
    x: 50,
    y: 1400,
    width: 350,
    height: 350,
    discovered: false,
    description: '繁星闪烁的静谧夜空',
    themeColor: '#9B7EDC',
    decoration: 'starry',
  },
  {
    id: 'emotion-area-rainbow',
    name: '彩虹之桥',
    x: 1025,
    y: 50,
    width: 350,
    height: 350,
    discovered: false,
    description: '七色光芒的天堑通途',
    themeColor: '#FF6B9D',
    decoration: 'crystal',
  },
  {
    id: 'emotion-area-garden',
    name: '永恒花园',
    x: 1025,
    y: 1400,
    width: 350,
    height: 350,
    discovered: false,
    description: '永不凋零的秘密花境',
    themeColor: '#FFB6C8',
    decoration: 'rose',
  },
];

export const EMOTION_STORIES: EmotionStory[] = [
  {
    id: 'emotion-story-sunrise',
    title: '晨曦之境',
    content: '小女孩曾经害怕黑暗，每一个夜晚都让她瑟瑟发抖。但蝴蝶教会她，黎明总会到来——只要心中怀揣喜悦，怀抱向前的勇气。她们一起在山顶等候日出，当第一缕阳光穿透云层时，小女孩终于明白：恐惧不是敌人，而是让光芒更加珍贵的理由。从此，她不再害怕夜晚，因为她知道，每一个黑夜的尽头，都是崭新的晨曦。',
    combinationId: 'combo-sunrise',
    unlocked: false,
  },
  {
    id: 'emotion-story-ocean',
    title: '深海追忆',
    content: '有些话，当时没能说出口；有些事，没能来得及做。小女孩把这些遗憾和思念，都沉入了记忆的深海。多年后，她和蝴蝶一起潜入这片海域，发现那些被封存的记忆并没有消失——它们化作了海底的珍珠，在黑暗中依然闪耀。原来，遗憾不是负担，而是让人更加珍惜当下的礼物；思念不是枷锁，而是连接过去与现在的桥梁。',
    combinationId: 'combo-ocean',
    unlocked: false,
  },
  {
    id: 'emotion-story-phoenix',
    title: '凤凰涅槃',
    content: '人生总有跌倒的时候，小女孩也曾因失败而一蹶不振。她望着满地的灰烬，以为一切都结束了。但蝴蝶围绕着她飞舞，翅膀扇起的微风让火星重新燃烧。「站起来，」蝴蝶仿佛在说，「每一次跌倒，都是重生的开始。」小女孩站起身来，心中燃起了比以往更加炽热的火焰。她终于明白，真正的勇气不是不害怕，而是即使害怕，也依然选择前行。',
    combinationId: 'combo-phoenix',
    unlocked: false,
  },
  {
    id: 'emotion-story-starry',
    title: '星河相望',
    content: '离开家乡的那些年，小女孩常常独自仰望星空。她相信，在另一个地方，也有人和她望着同一颗星星。思念如银河般绵长，每一颗星星都是一段甜蜜的回忆。蝴蝶陪伴着她，在星空下翩翩起舞。终于，当她回到熟悉的花园，她发现：那些思念的日子并没有白费，它们让重逢的喜悦变得更加珍贵。原来，距离不会稀释感情，只会让它变得更加醇厚。',
    combinationId: 'combo-starry',
    unlocked: false,
  },
  {
    id: 'emotion-story-rainbow',
    title: '彩虹之桥',
    content: '人的一生，是由无数种情感编织而成的锦缎。喜悦与遗憾，勇气与思念——它们看似矛盾，却共同构成了完整的自己。当小女孩终于学会接纳心中所有的情感时，一座七色的彩虹之桥在她眼前浮现。桥的这一端是过去，另一端是未来。蝴蝶停在她的肩头，轻声说：「走吧，带着所有的记忆，去遇见更好的自己。」小女孩微笑着踏上桥面，身后是繁花盛开的花园，前方是无限可能的明天。',
    combinationId: 'combo-rainbow',
    unlocked: false,
  },
  {
    id: 'emotion-story-garden',
    title: '永恒花园',
    content: '时光流逝，世事变迁，但有些东西永远不会凋零。小女孩用喜悦的阳光和思念的雨露，在心底种下了一座花园。这里的每一朵花，都承载着一段珍贵的回忆；每一片叶子，都写着一个人的名字。蝴蝶在花丛间自由飞舞，这里是她们永远的家。「只要我们还记得，」小女孩轻轻抚摸着花瓣，「那些美好的时光就永远不会真正消失。」是的，记忆化作的花朵，花开不败，四季如春。',
    combinationId: 'combo-garden',
    unlocked: false,
  },
];

export const checkCombinationUnlock = (
  combination: EmotionCombination,
  counts: EmotionCount
): boolean => {
  const total = counts.joy + counts.regret + counts.courage + counts.longing;
  if (total < combination.minTotal) return false;

  for (const [emotion, required] of Object.entries(combination.requiredEmotions)) {
    if (required && (counts as any)[emotion] < required) {
      return false;
    }
  }
  return true;
};

export const getMoodColorsFromEmotions = (counts: EmotionCount) => {
  const total = counts.joy + counts.regret + counts.courage + counts.longing;
  if (total === 0) return DEFAULT_MOOD_COLORS;

  let r1 = 168, g1 = 230, b1 = 207;
  let r2 = 136, g2 = 216, b2 = 168;
  let r3 = 107, g3 = 200, b3 = 138;

  const weights = {
    joy: counts.joy / total,
    regret: counts.regret / total,
    courage: counts.courage / total,
    longing: counts.longing / total,
  };

  const emotionColors = {
    joy: { start: [255, 248, 220], mid: [255, 215, 61], end: [255, 165, 0] },
    regret: { start: [224, 244, 255], mid: [135, 206, 235], end: [77, 166, 255] },
    courage: { start: [255, 224, 224], mid: [255, 107, 107], end: [255, 69, 0] },
    longing: { start: [240, 230, 255], mid: [155, 126, 220], end: [128, 0, 128] },
  };

  for (const emotion of Object.keys(weights) as EmotionType[]) {
    const w = weights[emotion];
    const colors = emotionColors[emotion];
    r1 = Math.round(r1 * (1 - w) + colors.start[0] * w);
    g1 = Math.round(g1 * (1 - w) + colors.start[1] * w);
    b1 = Math.round(b1 * (1 - w) + colors.start[2] * w);
    r2 = Math.round(r2 * (1 - w) + colors.mid[0] * w);
    g2 = Math.round(g2 * (1 - w) + colors.mid[1] * w);
    b2 = Math.round(b2 * (1 - w) + colors.mid[2] * w);
    r3 = Math.round(r3 * (1 - w) + colors.end[0] * w);
    g3 = Math.round(g3 * (1 - w) + colors.end[1] * w);
    b3 = Math.round(b3 * (1 - w) + colors.end[2] * w);
  }

  const toHex = (v: number) => v.toString(16).padStart(2, '0');

  return {
    groundStart: `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`,
    groundMid: `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`,
    groundEnd: `#${toHex(r3)}${toHex(g3)}${toHex(b3)}`,
  };
};

export const getDominantEmotion = (counts: EmotionCount): EmotionType | null => {
  const entries = Object.entries(counts) as [EmotionType, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return null;
  return sorted[0][0];
};

export const getEmotionColorPalette = (activeCombination: EmotionCombination | null, counts: EmotionCount) => {
  if (activeCombination) {
    return {
      primary: activeCombination.colorTheme,
      secondary: activeCombination.colorTheme,
      accent: activeCombination.colorTheme,
    };
  }

  const dominant = getDominantEmotion(counts);
  if (dominant) {
    const emotion = EMOTIONS[dominant];
    return {
      primary: emotion.color,
      secondary: emotion.glowColor,
      accent: emotion.bgColor,
    };
  }

  return {
    primary: '#9B7EDC',
    secondary: '#B39DDB',
    accent: '#F0E6FF',
  };
};
