export const validNoticeLift = (v: number[]) => v.length === 2 && v.every(n => n === 0 || n === 1);
