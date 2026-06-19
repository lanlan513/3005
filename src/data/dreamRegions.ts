import { DreamRegion, DreamDecoration } from '../types/game';

export const DREAM_REGIONS: DreamRegion[] = [
  {
    id: 'region-cherry',
    name: '樱花之境',
    description: '粉色花瓣飘落的梦幻樱花园',
    fragmentId: 'fragment-1',
    x: 100,
    y: 200,
    width: 500,
    height: 450,
    unlocked: false,
    themeColor: '#FFB6C8',
    bgColor: '#FFE4E9',
    terrainType: 'garden',
    hasDynamicTerrain: true,
    dynamicType: 'petals',
    decorationCount: 15,
    order: 1,
  },
  {
    id: 'region-rose',
    name: '玫瑰秘境',
    description: '盛开着各色玫瑰的神秘花园',
    fragmentId: 'fragment-2',
    x: 900,
    y: 100,
    width: 550,
    height: 400,
    unlocked: false,
    themeColor: '#FF6B9D',
    bgColor: '#FFE0EB',
    terrainType: 'garden',
    hasDynamicTerrain: true,
    dynamicType: 'bloom',
    decorationCount: 18,
    order: 2,
  },
  {
    id: 'region-sunflower',
    name: '向日葵田',
    description: '金色向日葵追随太阳的田野',
    fragmentId: 'fragment-3',
    x: 1700,
    y: 200,
    width: 600,
    height: 500,
    unlocked: false,
    themeColor: '#FFD93D',
    bgColor: '#FFF4CC',
    terrainType: 'field',
    hasDynamicTerrain: true,
    dynamicType: 'sway',
    decorationCount: 20,
    order: 3,
  },
  {
    id: 'region-maple',
    name: '枫叶幽谷',
    description: '红叶纷飞的幽静山谷',
    fragmentId: 'fragment-4',
    x: 200,
    y: 900,
    width: 500,
    height: 500,
    unlocked: false,
    themeColor: '#FF8C42',
    bgColor: '#FFE4D6',
    terrainType: 'valley',
    hasDynamicTerrain: true,
    dynamicType: 'leaves',
    decorationCount: 16,
    order: 4,
  },
  {
    id: 'region-snow',
    name: '冰雪湖泊',
    description: '被白雪覆盖的宁静湖泊',
    fragmentId: 'fragment-5',
    x: 1500,
    y: 1000,
    width: 600,
    height: 550,
    unlocked: false,
    themeColor: '#87CEEB',
    bgColor: '#E0F4FF',
    terrainType: 'lake',
    hasDynamicTerrain: true,
    dynamicType: 'snowflakes',
    decorationCount: 12,
    order: 5,
  },
  {
    id: 'region-rainbow',
    name: '彩虹桥畔',
    description: '连接所有梦境的彩虹之桥',
    fragmentId: 'fragment-6',
    x: 850,
    y: 700,
    width: 700,
    height: 450,
    unlocked: false,
    themeColor: '#9B7EDC',
    bgColor: '#F0E6FF',
    terrainType: 'bridge',
    hasDynamicTerrain: true,
    dynamicType: 'rainbow',
    decorationCount: 25,
    order: 6,
  },
];

export const generateRegionDecorations = (region: DreamRegion): DreamDecoration[] => {
  const decorations: DreamDecoration[] = [];
  const types: DreamDecoration['type'][] = ['tree', 'flower', 'rock', 'bush'];

  for (let i = 0; i < region.decorationCount; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    decorations.push({
      id: `${region.id}-deco-${i}`,
      type,
      x: region.x + 30 + Math.random() * (region.width - 60),
      y: region.y + 30 + Math.random() * (region.height - 60),
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
