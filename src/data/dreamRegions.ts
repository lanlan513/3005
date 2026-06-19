import { DreamRegion, DreamDecoration } from '../types/game';

export const START_REGION: DreamRegion = {
  id: 'region-start',
  name: '起始花园',
  description: '一切开始的地方，熟悉的小花丛',
  fragmentId: '',
  x: 700,
  y: 700,
  width: 600,
  height: 600,
  unlocked: true,
  themeColor: '#A8E6CF',
  bgColor: '#D4F5E3',
  terrainType: 'garden',
  hasDynamicTerrain: true,
  dynamicType: 'sway',
  decorationCount: 12,
  order: 0,
  isStart: true,
};

export const DREAM_REGIONS: DreamRegion[] = [
  START_REGION,
  {
    id: 'region-cherry',
    name: '樱花之境',
    description: '粉色花瓣飘落的梦幻樱花园',
    fragmentId: 'fragment-1',
    x: 700,
    y: 50,
    width: 600,
    height: 650,
    unlocked: false,
    themeColor: '#FFB6C8',
    bgColor: '#FFE4E9',
    terrainType: 'garden',
    hasDynamicTerrain: true,
    dynamicType: 'petals',
    decorationCount: 15,
    order: 1,
    connectsTo: ['region-start'],
    connectDirection: 'north',
  },
  {
    id: 'region-rose',
    name: '玫瑰秘境',
    description: '盛开着各色玫瑰的神秘花园',
    fragmentId: 'fragment-2',
    x: 1300,
    y: 50,
    width: 600,
    height: 650,
    unlocked: false,
    themeColor: '#FF6B9D',
    bgColor: '#FFE0EB',
    terrainType: 'garden',
    hasDynamicTerrain: true,
    dynamicType: 'bloom',
    decorationCount: 18,
    order: 2,
    connectsTo: ['region-cherry'],
    connectDirection: 'east',
  },
  {
    id: 'region-sunflower',
    name: '向日葵田',
    description: '金色向日葵追随太阳的田野',
    fragmentId: 'fragment-3',
    x: 1300,
    y: 700,
    width: 600,
    height: 600,
    unlocked: false,
    themeColor: '#FFD93D',
    bgColor: '#FFF4CC',
    terrainType: 'field',
    hasDynamicTerrain: true,
    dynamicType: 'sway',
    decorationCount: 20,
    order: 3,
    connectsTo: ['region-start', 'region-rose'],
    connectDirection: 'east',
  },
  {
    id: 'region-maple',
    name: '枫叶幽谷',
    description: '红叶纷飞的幽静山谷',
    fragmentId: 'fragment-4',
    x: 100,
    y: 700,
    width: 600,
    height: 600,
    unlocked: false,
    themeColor: '#FF8C42',
    bgColor: '#FFE4D6',
    terrainType: 'valley',
    hasDynamicTerrain: true,
    dynamicType: 'leaves',
    decorationCount: 16,
    order: 4,
    connectsTo: ['region-start'],
    connectDirection: 'west',
  },
  {
    id: 'region-snow',
    name: '冰雪湖泊',
    description: '被白雪覆盖的宁静湖泊',
    fragmentId: 'fragment-5',
    x: 700,
    y: 1300,
    width: 600,
    height: 600,
    unlocked: false,
    themeColor: '#87CEEB',
    bgColor: '#E0F4FF',
    terrainType: 'lake',
    hasDynamicTerrain: true,
    dynamicType: 'snowflakes',
    decorationCount: 12,
    order: 5,
    connectsTo: ['region-start', 'region-maple'],
    connectDirection: 'south',
  },
  {
    id: 'region-rainbow',
    name: '彩虹桥畔',
    description: '连接所有梦境的彩虹之桥',
    fragmentId: 'fragment-6',
    x: 100,
    y: 1300,
    width: 600,
    height: 600,
    unlocked: false,
    themeColor: '#9B7EDC',
    bgColor: '#F0E6FF',
    terrainType: 'bridge',
    hasDynamicTerrain: true,
    dynamicType: 'rainbow',
    decorationCount: 25,
    order: 6,
    connectsTo: ['region-snow', 'region-maple'],
    connectDirection: 'southwest',
  },
];

export const getInitialMapBounds = () => {
  const start = DREAM_REGIONS.find(r => r.isStart)!;
  return {
    minX: start.x,
    minY: start.y,
    maxX: start.x + start.width,
    maxY: start.y + start.height,
  };
};

export const calculateMapBounds = (regions: DreamRegion[]) => {
  const unlocked = regions.filter(r => r.unlocked);
  if (unlocked.length === 0) return getInitialMapBounds();

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of unlocked) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { minX, minY, maxX, maxY };
};

export const generateRegionDecorations = (region: DreamRegion): DreamDecoration[] => {
  const decorations: DreamDecoration[] = [];
  const types: DreamDecoration['type'][] = ['tree', 'flower', 'rock', 'bush'];

  for (let i = 0; i < region.decorationCount; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    decorations.push({
      id: `${region.id}-deco-${i}`,
      type,
      x: region.x + 40 + Math.random() * (region.width - 80),
      y: region.y + 40 + Math.random() * (region.height - 80),
      size: 20 + Math.random() * 30,
      color: region.themeColor,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return decorations;
};

export const getRegionByFragmentId = (fragmentId: string): DreamRegion | undefined => {
  return DREAM_REGIONS.find((r) => r.fragmentId === fragmentId);
};

export const getUnlockMessage = (region: DreamRegion): string => {
  return `梦境碎片拼接完成 · ${region.name} 已显现`;
};
