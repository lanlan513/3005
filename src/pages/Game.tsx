import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { MiniMap } from '../components/MiniMap';
import { StoryModal } from '../components/StoryModal';
import { StoryBook } from '../components/StoryBook';
import { FlowerCard } from '../components/FlowerCard';
import { AbilityUnlockModal } from '../components/AbilityUnlockModal';
import { CompanionEncounter } from '../components/CompanionEncounter';
import { CompanionPanel } from '../components/CompanionPanel';

export const Game = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <GameCanvas />
      <HUD />
      <MiniMap />
      <StoryModal />
      <StoryBook />
      <FlowerCard />
      <AbilityUnlockModal />
      <CompanionEncounter />
      <CompanionPanel />
    </div>
  );
};
