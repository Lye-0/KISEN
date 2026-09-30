export const posters = [{ name: '甲', left: [18, 62], right: [24, 80], leftCode: '4706', rightCode: '8352' }, { name: '乙', left: [20, 70], right: [34, 78], leftCode: '9168', rightCode: '2839' }, { name: '丙', left: [12, 52], right: [18, 62], leftCode: '6253', rightCode: '4706' }, { name: '丁', left: [28, 66], right: [42, 86], leftCode: '3192', rightCode: '7584' }] as const;
export const posterCode = [4, 7, 0, 6];
export function posterEdgesMeet(left: number, right: number, backs: boolean[]) { const a = posters[left], b = posters[right]; return !!a && !!b && left !== right && !backs[left] && !backs[right] && a.right.every((v, i) => v === b.left[i]); }
export function validShedDigits(v: number[]) { return v.length === 4 && v.every(n => Number.isInteger(n) && n >= 0 && n <= 9); }
export const shedUnlocks = (v: number[]) => validShedDigits(v) && v.every((n, i) => n === posterCode[i]);
