import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Map } from 'lucide-react';

export const MiniMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    butterfly,
    fragments,
    flowers,
    fogGrid,
    fogCellSize,
    mapWidth,
    mapHeight,
    cameraX,
    cameraY,
    viewportWidth,
    viewportHeight,
    explorationProgress,
    hiddenAreas,
    abilities,
    dreamRegions,
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
          ctx.fillStyle = `rgba(${brightness}, ${brightness - 20}, ${brightness + 40}, ${0.3 + cell.visibility * 0.5})`;
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

    for (const flower of flowers) {
      if (flower.type === 'decorative') continue;
      const fx = flower.x * scaleX;
      const fy = flower.y * scaleY;

      if (flower.discovered) {
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? 4 : 2;
          const px = fx + Math.cos(angle) * r;
          const py = fy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (flower.unlocked) {
        ctx.fillStyle = flower.color + 'AA';
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

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

    for (const region of dreamRegions) {
      const rx = region.x * scaleX;
      const ry = region.y * scaleY;
      const rw = region.width * scaleX;
      const rh = region.height * scaleY;

      if (region.unlocked) {
        ctx.fillStyle = region.themeColor + '35';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = region.themeColor + 'AA';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);
        
        ctx.fillStyle = region.themeColor;
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(region.name, rx + rw / 2, ry + rh / 2 + 3);
      } else {
        ctx.fillStyle = region.themeColor + '10';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = region.themeColor + '25';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);

        ctx.fillStyle = region.themeColor + '55';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', rx + rw / 2, ry + rh / 2);
      }
    }

    for (const area of hiddenAreas) {
      const ax = area.x * scaleX;
      const ay = area.y * scaleY;
      const aw = area.width * scaleX;
      const ah = area.height * scaleY;

      const ability = abilities.find(a => a.id === area.requiredAbility);
      const canDiscover = ability && ability.unlocked;

      if (area.discovered) {
        ctx.fillStyle = area.color + '40';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(ax, ay, aw, ah);
        ctx.setLineDash([]);
        
        ctx.fillStyle = area.color;
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', ax + aw / 2, ay + ah / 2 + 3);
      } else if (canDiscover) {
        ctx.fillStyle = area.color + '15';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = area.color + '40';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(ax, ay, aw, ah);
        ctx.setLineDash([]);
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
  }, [butterfly, fragments, flowers, fogGrid, fogCellSize, mapWidth, mapHeight, cameraX, cameraY, viewportWidth, viewportHeight, dreamRegions, hiddenAreas, abilities]);

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
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-white" />
            <span className="text-purple-600">你</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-400" />
            <span className="text-purple-600">记忆碎片</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-400" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
            <span className="text-purple-600">已发现花朵</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-pink-300/60 border border-pink-400" />
            <span className="text-purple-600">梦境区域</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-400/50" />
            <span className="text-purple-600">已探索</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-dashed border-yellow-400" />
            <span className="text-purple-600">隐藏区域</span>
          </div>
        </div>
      </div>
    </div>
  );
};
