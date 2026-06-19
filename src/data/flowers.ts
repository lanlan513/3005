import { Flower } from '../types/game';

export const FLOWER_DATA: Omit<Flower, 'swayPhase' | 'bloomPhase' | 'pulsePhase'>[] = [
  {
    id: 'flower-cherry',
    x: 350,
    y: 450,
    size: 28,
    color: '#FFB6C8',
    petalCount: 5,
    type: 'cherry',
    name: '樱花',
    unlocked: true,
    discovered: false,
    unlockCondition: '',
    memory: '小女孩第一次遇见蝴蝶的那天，樱花开得正盛。粉色的花瓣像雪花一样飘落，蝴蝶停在她的指尖，仿佛在诉说着春天的秘密。那是她们故事的开始，也是记忆中最温柔的一页。',
    knowledge: '樱花，学名Cerasus sp.，是蔷薇科樱亚属植物的统称。樱花原产于北半球温带环喜马拉雅山地区，在世界各地都有生长。樱花花期通常在春季，每支花有3到5朵花瓣，花色多为白色或粉色。樱花象征着纯洁、高尚和短暂的美丽，是日本的国花。',
    flowerLanguage: '生命中最美的相遇',
  },
  {
    id: 'flower-rose',
    x: 1100,
    y: 350,
    size: 26,
    color: '#FF6B9D',
    petalCount: 8,
    type: 'rose',
    name: '玫瑰',
    unlocked: true,
    discovered: false,
    unlockCondition: '',
    memory: '夏日的午后，小女孩在玫瑰园里读书。蝴蝶静静地停在书页上，仿佛也在聆听故事。玫瑰的香气弥漫在空气中，阳光透过花瓣洒下斑驳的光影。那是属于她们的秘密时光。',
    knowledge: '玫瑰，学名Rosa rugosa，是蔷薇科蔷薇属的落叶灌木。玫瑰原产于中国华北以及日本和朝鲜。玫瑰花色丰富，有红、粉、白、黄等多种颜色。玫瑰不仅具有极高的观赏价值，还可以提取玫瑰精油用于香料制作。玫瑰象征着爱情和美丽。',
    flowerLanguage: '无声的爱与陪伴',
  },
  {
    id: 'flower-sunflower',
    x: 1900,
    y: 500,
    size: 32,
    color: '#FFD93D',
    petalCount: 12,
    type: 'sunflower',
    name: '向日葵',
    unlocked: true,
    discovered: false,
    unlockCondition: '',
    memory: '向日葵田里，小女孩仰着头看向日葵追随太阳的方向。蝴蝶在花丛中翩翩起舞，仿佛也在追逐阳光。她们一起度过了一个金灿灿的夏天，笑声在田野里回荡。',
    knowledge: '向日葵，学名Helianthus annuus，是菊科向日葵属的一年生草本植物。向日葵原产于南美洲，因花序随太阳转动而得名。向日葵的花盘由舌状花和管状花组成，外围是黄色的舌状花，中间是棕色的管状花。向日葵的种子就是我们常吃的瓜子，可以榨油。',
    flowerLanguage: '永远向着阳光生长',
  },
  {
    id: 'flower-lavender',
    x: 500,
    y: 1100,
    size: 22,
    color: '#9B7EDC',
    petalCount: 6,
    type: 'lavender',
    name: '薰衣草',
    unlocked: false,
    discovered: false,
    unlockCondition: '收集至少2段记忆碎片',
    memory: '紫色的薰衣草田是她们的秘密基地。小女孩躺在花海里，蝴蝶停在她的发梢。微风拂过，紫色的波浪轻轻摇曳，空气中弥漫着淡淡的清香。那一刻，时间仿佛静止了。',
    knowledge: '薰衣草，学名Lavandula angustifolia，是唇形科薰衣草属的多年生草本或小矮灌木。薰衣草原产于地中海沿岸、欧洲各地及大洋洲列岛。薰衣草的花呈蓝紫色穗状花序，具有特殊的香气。薰衣草常被用于制作香包、精油，具有镇静、舒缓的功效。',
    flowerLanguage: '等待爱情的奇迹',
  },
  {
    id: 'flower-tulip',
    x: 1700,
    y: 1300,
    size: 24,
    color: '#FF9ECD',
    petalCount: 6,
    type: 'tulip',
    name: '郁金香',
    unlocked: false,
    discovered: false,
    unlockCondition: '收集至少3段记忆碎片',
    memory: '春天的郁金香花园里，色彩斑斓的花朵竞相绽放。小女孩带着蝴蝶来看花，告诉她每一种颜色的花语。蝴蝶在花丛中飞舞，仿佛在为这场花的盛会跳舞。',
    knowledge: '郁金香，学名Tulipa gesneriana，是百合科郁金香属的多年生草本植物。郁金香原产于地中海沿岸及中亚细亚、土耳其等地。郁金香的花呈杯状，有红、橙、黄、紫、白等多种颜色。郁金香是荷兰、土耳其、匈牙利等国的国花，象征着博爱、体贴和高雅。',
    flowerLanguage: '永恒的祝福',
  },
  {
    id: 'flower-lotus',
    x: 1300,
    y: 800,
    size: 30,
    color: '#FFE66D',
    petalCount: 10,
    type: 'lotus',
    name: '莲花',
    unlocked: false,
    discovered: false,
    unlockCondition: '探索进度达到50%',
    memory: '夏日的池塘边，莲花静静绽放。小女孩坐在池塘边，看着水中的倒影，蝴蝶停在她的肩膀上。她们一起看蜻蜓点水，看鱼儿嬉戏。莲花的清香伴随着她们度过了一个宁静的午后。',
    knowledge: '莲花，学名Nelumbo nucifera，是莲科莲属的多年生水生草本花卉。莲花原产于亚洲热带和温带地区。莲花的花单生于花梗顶端，花瓣多数，嵌生在花托穴内，有红、粉红、白、紫等颜色。莲花出淤泥而不染，是纯洁与高雅的象征，也是中国的十大名花之一。',
    flowerLanguage: '出淤泥而不染的纯洁',
  },
  {
    id: 'flower-daisy',
    x: 250,
    y: 1500,
    size: 20,
    color: '#FFFFFF',
    petalCount: 12,
    type: 'daisy',
    name: '雏菊',
    unlocked: true,
    discovered: false,
    unlockCondition: '',
    memory: '草地上开满了小小的雏菊，像星星撒落在人间。小女孩蹲在花丛中，数着花瓣。蝴蝶飞来，停在一朵最大的雏菊上，仿佛在和她玩捉迷藏。那是她们最简单的快乐。',
    knowledge: '雏菊，学名Bellis perennis，是菊科雏菊属的多年生草本植物。雏菊原产于欧洲，原种被视为丛生的杂草。雏菊的花小巧玲珑，花色多为白色、粉色或红色，中间是黄色的花心。雏菊因为花朵小巧可爱，常被用来象征纯洁的美和天真烂漫。',
    flowerLanguage: '藏在心底的爱',
  },
  {
    id: 'flower-daffodil',
    x: 2100,
    y: 1000,
    size: 24,
    color: '#FFE66D',
    petalCount: 6,
    type: 'daffodil',
    name: '水仙花',
    unlocked: false,
    discovered: false,
    unlockCondition: '收集至少4段记忆碎片',
    memory: '冬天快要结束的时候，水仙花开了。小女孩把水仙花摆在窗前，每天都来看它。蝴蝶也飞来，停在花瓣上，仿佛在迎接春天的到来。她们一起等待着，等待着温暖的日子重新回来。',
    knowledge: '水仙花，学名Narcissus tazetta，是石蒜科水仙属的多年生草本植物。水仙花原产于地中海沿岸，在中国已有一千多年栽培历史。水仙花的花为伞形花序，花瓣多为白色，花心呈黄色杯状。水仙花香气浓郁，常被用于观赏和提取香料。',
    flowerLanguage: '只爱自己的倒影',
  },
];

export const getFlowerById = (id: string): Flower | undefined => {
  return FLOWER_DATA.find((f) => f.id === id) as Flower | undefined;
};

export const checkFlowerUnlock = (flower: Flower, collectedCount: number, explorationProgress: number): boolean => {
  if (flower.unlocked) return true;
  
  const condition = flower.unlockCondition;
  
  if (condition.startsWith('收集至少')) {
    const count = parseInt(condition.match(/\d+/)?.[0] || '0');
    return collectedCount >= count;
  }
  
  if (condition.startsWith('探索进度达到')) {
    const progress = parseInt(condition.match(/\d+/)?.[0] || '0');
    return explorationProgress >= progress;
  }
  
  return false;
};
