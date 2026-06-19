export interface Butterfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  wingPhase: number;
  isDashing: boolean;
  dashCooldown: number;
  isGliding: boolean;
  glideEnergy: number;
}

export interface ButterflyAbility {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockCondition: string;
  icon: string;
  level: number;
  maxLevel: number;
}

export interface HiddenArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  requiredAbility: string;
  discovered: boolean;
  color: string;
  description: string;
}

export interface AbilityLevel {
  speedMultiplier: number;
  visibilityMultiplier: number;
  dashPower: number;
  glideEfficiency: number;
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
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  petalCount: number;
  swayPhase: number;
  type: string;
  name: string;
  unlocked: boolean;
  discovered: boolean;
  unlockCondition: string;
  memory: string;
  knowledge: string;
  flowerLanguage: string;
  bloomPhase: number;
  pulsePhase: number;
}

export interface Tree {
  x: number;
  y: number;
  size: number;
  type: 'round' | 'pine' | 'cherry';
}

export interface FogCell {
  x: number;
  y: number;
  explored: boolean;
  visibility: number;
}

export type CompanionAbility = 'light' | 'discover' | 'hint';

export type CompanionPersonality = 'curious' | 'calm' | 'playful' | 'wise' | 'shy';

export interface ButterflyCompanion {
  id: string;
  name: string;
  personality: CompanionPersonality;
  ability: CompanionAbility;
  description: string;
  color: string;
  wingColor: string;
  spotColor: string;
  unlocked: boolean;
  x: number;
  y: number;
  encounterCondition: string;
  encounterProgress: number;
  encounterTarget: number;
  abilityPower: number;
  quote: string;
}

export interface CompanionState {
  companions: ButterflyCompanion[];
  activeCompanionId: string | null;
  showCompanionPanel: boolean;
  showCompanionEncounter: boolean;
  encounterCompanion: ButterflyCompanion | null;
  companionParticles: Particle[];
}

export interface GameState extends CompanionState {
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
  flowers: Flower[];
  discoveredFlowers: string[];
  showFlowerCard: boolean;
  currentFlower: Flower | null;
  mapWidth: number;
  mapHeight: number;
  cameraX: number;
  cameraY: number;
  viewportWidth: number;
  viewportHeight: number;
  fogGrid: FogCell[][];
  fogCellSize: number;
  exploredCells: number;
  totalCells: number;
  explorationProgress: number;
  abilities: ButterflyAbility[];
  abilityLevel: AbilityLevel;
  hiddenAreas: HiddenArea[];
  showAbilityUnlock: boolean;
  unlockAbility: ButterflyAbility | null;
  baseSpeed: number;
  baseVisibility: number;
}
