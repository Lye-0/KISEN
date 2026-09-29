import { it, expect } from 'vitest';
import { sameOpening } from './ticketGeometry';
it('同じ孔を重ねて切っても一つの孔で、内側の小さい切り跡は大きな孔へ吸収される', () => { expect(sameOpening(['E', 'E'], 'E')).toBe(true); expect(sameOpening(['D', 'E'], 'E')).toBe(false); expect(sameOpening(['D', 'F'], 'F')).toBe(true); expect(sameOpening(['F', 'A'], 'A')).toBe(false); expect(sameOpening(['C'], 'C')).toBe(true); expect(sameOpening(['E'], 'F')).toBe(false); });
