import { Fragment } from '../types/game';

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1800;

export const INITIAL_FRAGMENTS: Fragment[] = [
  {
    id: 'fragment-1',
    x: 400,
    y: 500,
    collected: false,
    storyId: 'story-1',
    glowPhase: 0,
    floatPhase: 0,
    color: '#FFB6C8',
  },
  {
    id: 'fragment-2',
    x: 1200,
    y: 300,
    collected: false,
    storyId: 'story-2',
    glowPhase: Math.PI / 3,
    floatPhase: Math.PI / 4,
    color: '#9B7EDC',
  },
  {
    id: 'fragment-3',
    x: 2000,
    y: 600,
    collected: false,
    storyId: 'story-3',
    glowPhase: Math.PI / 2,
    floatPhase: Math.PI / 2,
    color: '#A8E6CF',
  },
  {
    id: 'fragment-4',
    x: 600,
    y: 1200,
    collected: false,
    storyId: 'story-4',
    glowPhase: Math.PI,
    floatPhase: Math.PI,
    color: '#FFD93D',
  },
  {
    id: 'fragment-5',
    x: 1800,
    y: 1400,
    collected: false,
    storyId: 'story-5',
    glowPhase: Math.PI * 1.2,
    floatPhase: Math.PI * 1.5,
    color: '#87CEEB',
  },
  {
    id: 'fragment-6',
    x: 1200,
    y: 900,
    collected: false,
    storyId: 'story-6',
    glowPhase: Math.PI * 1.5,
    floatPhase: Math.PI * 0.7,
    color: '#FFB6C8',
  },
];
