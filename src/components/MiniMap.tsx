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
    mapBounds,
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
  const worldW = mapBounds.maxX - mapBounds.minX;
  const worldH = mapBounds.maxY - mapBounds.minY;
  const scaleX = miniMapWidth / worldW;
  const scaleY = miniMapHeight / worldH;
  const scale = Math.min(scaleX, scaleY);

  const worldToMini = (wx: number, wy: number) => ({
    x: (wx - mapBounds.minX) * scale,
    y: (wy - mapBounds.minY) * scale,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, miniMapWidth, miniMapHeight);

    ctx.fillStyle = 'rgba(30, 20, 50, 0.9)';
    ctx.fillRect(0, 0, miniMapWidth, miniMapHeight);

    for (const region of dreamRegions) {
      if (!region.unlocked) continue;
      const r1 = worldToMini(region.x, region.y);
      const rw = region.width * scale;
      const rh = region.height * scale;

      ctx.fillStyle = region.themeColor + '35';
      ctx.fillRect(r1.x, r1.y, rw, rh);
      ctx.strokeStyle = region.themeColor + 'AA';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(r1.x, r1.y, rw, rh);
      ctx.setLineDash([]);
      
      ctx.fillStyle = region.themeColor;
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(region.name, r1.x + rw / 2, r1.y + rh / 2 + 3);
    }

    for (let row = 0; row < fogGrid.length; row++) {
      for (let col = 0; col < fogGrid[row].length; col++) {
        const cell = fogGrid[row][col];
        if (!cell.explored) continue;
        if (cell.x < mapBounds.minX || cell.x > mapBounds.maxX ||
            cell.y < mapBounds.minY || cell.y > mapBounds.maxY) continue;
        
        const p = worldToMini(cell.x, cell.y);
        const w = fogCellSize * scale + 1;
        const h = fogCellSize * scale + 1;

        const brightness = Math.floor(60 + cell.visibility * 80);
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 20}, ${brightness + 40}, ${0.3 + cell.visibility * 0.5})`;
        ctx.fillRect(p.x, p.y, w, h);
      }
    }

    ctx.strokeStyle = 'rgba(155, 126, 220, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, miniMapWidth, miniMapHeight);

    const vp = worldToMini(cameraX - viewportWidth / 2, cameraY - viewportHeight / 2);
    const viewportMapW = viewportWidth * scale;
    const viewportMapH = viewportHeight * scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(vp.x, vp.y, viewportMapW, viewportMapH);
    ctx.setLineDash([]);

    for (const flower of flowers) {
      if (flower.type === 'decorative') continue;
      if (flower.x < mapBounds.minX || flower.x > mapBounds.maxX ||
          flower.y < mapBounds.minY || flower.y > mapBounds.maxY) continue;
      
      const fp = worldToMini(flower.x, flower.y);

      if (flower.discovered) {
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? 4 : 2;
          const px = fp.x + Math.cos(angle) * r;
          const py = fp.y + Math.sin(angle) * r;
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
        ctx.arc(fp.x, fp.y, 3, 0, Math.PI * 2);
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
      if (fragment.x < mapBounds.minX || fragment.x > mapBounds.maxX ||
          fragment.y < mapBounds.minY || fragment.y > mapBounds.maxY) continue;
      
      const fp = worldToMini(fragment.x, fragment.y);
      const isStoryFragment = !fragment.id.startsWith('fragment-random-');

      if (isStoryFragment) {
        ctx.fillStyle = fragment.color;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = fragment.color;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const area of hiddenAreas) {
      if (area.x < mapBounds.minX || area.x > mapBounds.maxX ||
          area.y < mapBounds.minY || area.y > mapBounds.maxY) continue;

      const ap1 = worldToMini(area.x, area.y);
      const aw = area.width * scale;
      const ah = area.height * scale;

      const ability = abilities.find(a => a.id === area.requiredAbility);
      const canDiscover = ability && ability.unlocked;

      if (area.discovered) {
        ctx.fillStyle = area.color + '40';
        ctx.fillRect(ap1.x, ap1.y, aw, ah);
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(ap1.x, ap1.y, aw, ah);
        ctx.setLineDash([]);
        
        ctx.fillStyle = area.color;
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', ap1.x + aw / 2, ap1.y + ah / 2 + 3);
      } else if (canDiscover) {
        ctx.fillStyle = area.color + '15';
        ctx.fillRect(ap1.x, ap1.y, aw, ah);
        ctx.strokeStyle = area.color + '40';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(ap1.x, ap1.y, aw, ah);
        ctx.setLineDash([]);
      }
    }

    const bp = worldToMini(butterfly.x, butterfly.y);
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    const glow = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, 10);
    glow.addColorStop(0, 'rgba(255, 217, 61, 0.5)');
    glow.addColorStop(1, 'rgba(255, 217, 61, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }, [butterfly, fragments, flowers, fogGrid, fogCellSize, mapBounds, cameraX, cameraY, viewportWidth, viewportHeight, dreamRegions, hiddenAreas, abilities]);

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
