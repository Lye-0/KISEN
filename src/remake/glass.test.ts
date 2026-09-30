import { expect, it } from 'vitest';
import { newState, reduce, restore } from './model';
import { glass, glassCameras, glassPosts, reflect, glassHit, projectedPost, glassExposure } from './glassGeometry';
it('二つの視点は同じガラスを通し、白い実物と白い反射の重なりが視差で変わる', () => {
    for (const c of glassCameras)
        for (const p of glassPosts)
            for (const z of [0, 2.1]) {
                const at = [p.position[0], p.position[1], z] as [
                    number,
                    number,
                    number
                ];
                expect(glassHit(p.reflected ? reflect(at) : at, c), p.id).not.toBeNull();
            }
    const at = glassPosts[2].position;
    expect(reflect(reflect(at))[1]).toBeCloseTo(at[1]);
    expect((reflect(at)[1] + at[1]) / 2).toBe(glass.y);
    const separation = (view: number) => Math.abs(projectedPost(0, view).base.x - projectedPost(2, view).base.x);
    expect(separation(0)).toBeGreaterThan(25);
    expect(separation(1)).toBeLessThan(8);
    const dark = glassExposure(false), lit = glassExposure(true);
    expect(lit.transmitted).toBeGreaterThan(dark.transmitted);
    expect(lit.reflected).toBeGreaterThan(0);
    expect(lit.reflected).toBeLessThan(dark.reflected);
    expect(lit.reflected / lit.exposure).toBeCloseTo(dark.reflected / dark.exposure);
});
it('保守側道を往復し、所有する灯具を一台だけ着脱でき、設置と二つの記録が保存される', () => {
    let s = newState();
    s.room = 'north';
    s.camera = 0;
    s.locations.spareLamp = 'inventory';
    expect(reduce(s, { type: 'move', room: 'tunnel' })).toBe(s);
    s = reduce(s, { type: 'look', camera: 1 });
    s = reduce(s, { type: 'move', room: 'tunnel' });
    expect(s.room).toBe('tunnel');
    s = reduce(s, { type: 'glassLamp', item: 'spareLamp' });
    expect(s.locations.spareLamp).toBe('glassStand');
    expect(reduce(s, { type: 'take', item: 'spareLamp' })).toBe(s);
    expect(reduce(s, { type: 'put', item: 'spareLamp', place: 'inventory' })).toBe(s);
    const other = { ...s, locations: { ...s.locations, lamp: 'inventory' as const } };
    expect(reduce(other, { type: 'glassLamp', item: 'lamp' })).toBe(other);
    s = reduce(s, { type: 'record', id: 'glass-observation-0-1', values: [0, 1] });
    s = reduce(s, { type: 'look', camera: 1 });
    s = reduce(s, { type: 'record', id: 'glass-observation-1-1', values: [1, 1] });
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(s.flags).toEqual([]);
    s = reduce(s, { type: 'glassLamp', item: 'spareLamp' });
    expect(s.locations.spareLamp).toBe('inventory');
    expect(reduce(s, { type: 'move', room: 'office' })).toBe(s);
    s = reduce(s, { type: 'move', room: 'north', camera: 1 });
    expect(s.camera).toBe(1);
    expect(reduce(s, { type: 'glassLamp', item: 'spareLamp' })).toBe(s);
});
it('不正な窓の保存状態を拒否し、既存の保存データは読み込める', () => {
    const s = newState();
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(restore({ ...s, locations: { ...s.locations, lamp: 'glassStand', spareLamp: 'glassStand' } })).toBeNull();
    expect(restore({ ...s, locations: { ...s.locations, hook: 'glassStand' } })).toBeNull();
    expect(restore({ ...s, notes: [{ id: 'glass-observation-0-0', values: [0, 2], at: 0 }] })).toBeNull();
});
