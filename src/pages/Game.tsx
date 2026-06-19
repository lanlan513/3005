import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { MiniMap } from '../components/MiniMap';
import { StoryModal } from '../components/StoryModal';
import { StoryBook } from '../components/StoryBook';
import { FlowerCard } from '../components/FlowerCard';

export const Game = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <GameCanvas />
      <HUD />
      <MiniMap />
      <StoryModal />
      <StoryBook />
      <FlowerCard />
    </div>
  );
};
