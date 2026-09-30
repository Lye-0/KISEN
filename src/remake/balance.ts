export const balanceMasses = [2, 3] as const;
export const validBalance = (v: number[]) => v.length === 2 && v.every(n => Number.isInteger(n) && n >= 0 && n <= 3);
export const balanceMoment = (v: number[]) => balanceMasses[1] * (v[1] ?? 0) - balanceMasses[0] * (v[0] ?? 0);
export const balanceReleases = (v: number[]) => validBalance(v) && v.every(n => n > 0) && balanceMoment(v) === 0;
export const balanceAngle = (v: number[]) => Math.max(-18, Math.min(18, balanceMoment(v) * 3));
