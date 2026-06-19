import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { StoryModal } from '../components/StoryModal';
import { StoryBook } from '../components/StoryBook';

export const Game = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <GameCanvas />
      <HUD />
      <StoryModal />
      <StoryBook />
    </div>
  );
};
