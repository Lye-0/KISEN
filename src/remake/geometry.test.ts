import { it, expect } from 'vitest';
import { project, towerCameras, poles, tower, stationBuilding } from './geometry';
it('同じ塔の西と東で、傷のある柱と無傷の柱の前後が入れ替わる', () => {
    for (const side of ['west', 'east'] as const) {
        const c = towerCameras[side];
        const a = project([poles[0].base[0], poles[0].base[1], 6], c), b = project([poles[1].base[0], poles[1].base[1], 6], c);
        const near = side === 'west' ? a : b, far = side === 'west' ? b : a;
        expect(near.depth).toBeLessThan(far.depth);
        expect(Math.abs(near.x - 836)).toBeLessThan(70);
        expect(Math.abs(far.x - 836)).toBeGreaterThan(250);
    }
});
it('同じ西側梯子が二つの視点で画面の左右に現れる', () => { expect(project([tower.ladderX, tower.ladderY, 6], towerCameras.west).x).toBeGreaterThan(836); expect(project([tower.ladderX, tower.ladderY, 6], towerCameras.east).x).toBeLessThan(836); });
it('外壁六間に対して既知室は五間。残る一間と階段室が一致する', () => { expect(stationBuilding.width / stationBuilding.bay).toBe(6); expect(stationBuilding.knownRooms.reduce((s, r) => s + r.to - r.from, 0) / stationBuilding.bay).toBe(5); expect(stationBuilding.stairs.to - stationBuilding.stairs.from).toBe(stationBuilding.bay); });

it('柱が塔の同じ側に並ぶ観測は、東西の撮影側に限定される',()=>{
 let west=0,east=0;
 for(const radius of [14,18,24,40])for(let degree=0;degree<360;degree+=5){
  const rad=degree*Math.PI/180,x=radius*Math.cos(rad),y=radius*Math.sin(rad);
  const camera={...towerCameras.west,position:[x,y,2.4] as [number,number,number]};
  const centre=project([0,0,6],camera),seen=poles.map(p=>project([p.base[0],p.base[1],6],camera));
  if(seen.every(p=>p.x>centre.x)){west++;expect(x).toBeLessThan(-Math.abs(y));expect(seen[0].depth).toBeLessThan(centre.depth);}
  if(seen.every(p=>p.x<centre.x)){east++;expect(x).toBeGreaterThan(Math.abs(y));expect(seen[1].depth).toBeLessThan(centre.depth);}
 }
 expect(west).toBeGreaterThan(20);expect(east).toBeGreaterThan(20);
});
