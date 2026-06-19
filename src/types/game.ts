export interface Butterfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  wingPhase: number;
}

export interface Fragment {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  storyId: string;
  glowPhase: number;
  floatPhase: number;
  color: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  fragmentId: string;
  order: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
}

export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  glow: number;
}

export interface Flower {
  x: number;
  y: number;
  size: number;
  color: string;
  petalCount: number;
  swayPhase: number;
}

export interface Tree {
  x: number;
  y: number;
  size: number;
  type: 'round' | 'pine' | 'cherry';
}

export interface GameState {
  butterfly: Butterfly;
  fragments: Fragment[];
  collectedFragments: string[];
  unlockedStories: string[];
  isPlaying: boolean;
  showStory: boolean;
  currentStory: Story | null;
  showStoryBook: boolean;
  particles: Particle[];
  petals: Petal[];
  fireflies: Firefly[];
  mapWidth: number;
  mapHeight: number;
  cameraX: number;
  cameraY: number;
  viewportWidth: number;
  viewportHeight: number;
}
