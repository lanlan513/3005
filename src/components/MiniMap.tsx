import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Map } from 'lucide-react';

export const MiniMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    butterfly,
    fragments,
    fogGrid,
    fogCellSize,
    mapWidth,
    mapHeight,
    cameraX,
    cameraY,
    viewportWidth,
    viewportHeight,
    explorationProgress,
  } = useGameStore();

  const miniMapWidth = 180;
  const miniMapHeight = 135;
  const scaleX = miniMapWidth / mapWidth;
  const scaleY = miniMapHeight / mapHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, miniMapWidth, miniMapHeight);

    ctx.fillStyle = 'rgba(30, 20, 50, 0.9)';
    ctx.fillRect(0, 0, miniMapWidth, miniMapHeight);

    for (let row = 0; row < fogGrid.length; row++) {
      for (let col = 0; col < fogGrid[row].length; col++) {
        const cell = fogGrid[row][col];
        if (cell.explored) {
          const x = cell.x * scaleX;
          const y = cell.y * scaleY;
          const w = fogCellSize * scaleX + 1;
          const h = fogCellSize * scaleY + 1;

          const brightness = Math.floor(60 + cell.visibility * 80);
          ctx.fillStyle = `rgba(120, 100, 180, ${0.3 + cell.visibility * 0.5})`;
          ctx.fillRect(x, y, w, h);
        }
      }
    }

    ctx.strokeStyle = 'rgba(155, 126, 220, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, miniMapWidth, miniMapHeight);

    const viewportMapX = (cameraX - viewportWidth / 2) * scaleX;
    const viewportMapY = (cameraY - viewportHeight / 2) * scaleY;
    const viewportMapW = viewportWidth * scaleX;
    const viewportMapH = viewportHeight * scaleY;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(viewportMapX, viewportMapY, viewportMapW, viewportMapH);
    ctx.setLineDash([]);

    for (const fragment of fragments) {
      if (fragment.collected) continue;
      const fx = fragment.x * scaleX;
      const fy = fragment.y * scaleY;
      const isStoryFragment = !fragment.id.startsWith('fragment-random-');

      if (isStoryFragment) {
        ctx.fillStyle = fragment.color;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = fragment.color;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const px = butterfly.x * scaleX;
    const py = butterfly.y * scaleY;
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    const glow = ctx.createRadialGradient(px, py, 0, px, py, 10);
    glow.addColorStop(0, 'rgba(255, 217, 61, 0.5)');
    glow.addColorStop(1, 'rgba(255, 217, 61, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  }, [butterfly, fragments, fogGrid, fogCellSize, mapWidth, mapHeight, cameraX, cameraY, viewportWidth, viewportHeight]);

  return (
    <div className="fixed bottom-6 right-6 pointer-events-auto z-20">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-4 h-4 text-purple-600" />
          <span className="text-purple-700 font-medium text-sm tracking-wider">探索地图</span>
          <span className="ml-auto text-xs text-purple-500 font-bold">{explorationProgress}%</span>
        </div>
        <canvas
          ref={canvasRef}
          width={miniMapWidth}
          height={miniMapHeight}
          className="rounded-lg shadow-inner"
          style={{ display: 'block' }}
        />
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-purple-600 mb-1">
            <span>探索进度</span>
            <span>{explorationProgress}%</span>
          </div>
          <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${explorationProgress}%` }}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-white" />
            <span className="text-purple-600">你</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-400" />
            <span className="text-purple-600">记忆碎片</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-400/50" />
            <span className="text-purple-600">已探索</span>
          </div>
        </div>
      </div>
    </div>
  );
};
