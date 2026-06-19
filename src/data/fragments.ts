import { Fragment } from '../types/game';
import { START_REGION, DREAM_REGIONS } from './dreamRegions';

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1800;

const getRegionCenter = (regionId: string) => {
  const region = DREAM_REGIONS.find(r => r.id === regionId);
  if (!region) return { x: 1000, y: 1000 };
  return {
    x: region.x + region.width / 2,
    y: region.y + region.height / 2,
  };
};

export const INITIAL_FRAGMENTS: Fragment[] = [
  {
    id: 'fragment-1',
    x: START_REGION.x + START_REGION.width * 0.3,
    y: START_REGION.y + START_REGION.height * 0.35,
    collected: false,
    storyId: 'story-1',
    glowPhase: 0,
    floatPhase: 0,
    color: '#FFB6C8',
  },
  {
    id: 'fragment-4',
    x: START_REGION.x + START_REGION.width * 0.7,
    y: START_REGION.y + START_REGION.height * 0.65,
    collected: false,
    storyId: 'story-4',
    glowPhase: Math.PI / 3,
    floatPhase: Math.PI / 4,
    color: '#FF8C42',
  },
  {
    id: 'fragment-2',
    x: getRegionCenter('region-cherry').x,
    y: getRegionCenter('region-cherry').y,
    collected: false,
    storyId: 'story-2',
    glowPhase: Math.PI / 2,
    floatPhase: Math.PI / 2,
    color: '#FF6B9D',
  },
  {
    id: 'fragment-3',
    x: getRegionCenter('region-rose').x,
    y: getRegionCenter('region-rose').y,
    collected: false,
    storyId: 'story-3',
    glowPhase: Math.PI,
    floatPhase: Math.PI,
    color: '#FFD93D',
  },
  {
    id: 'fragment-5',
    x: getRegionCenter('region-maple').x,
    y: getRegionCenter('region-maple').y,
    collected: false,
    storyId: 'story-5',
    glowPhase: Math.PI * 1.2,
    floatPhase: Math.PI * 1.5,
    color: '#87CEEB',
  },
  {
    id: 'fragment-6',
    x: getRegionCenter('region-snow').x,
    y: getRegionCenter('region-snow').y,
    collected: false,
    storyId: 'story-6',
    glowPhase: Math.PI * 1.5,
    floatPhase: Math.PI * 0.7,
    color: '#9B7EDC',
  },
];
