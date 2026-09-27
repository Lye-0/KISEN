import type { Shape } from './model';
// The notch is deliberately off-centre: distance to it survives turning the paper over.
export const ticketOutline='M18 10H580V260H18V82L34 64L18 46Z';
export const punchRows=[72,202] as const;
export const ticketExamples:{name:string;route:string;direction:'into'|'away';stops:Shape[]}[]=[
 {name:'甲',route:'踏切 → 鉄塔 → 給水槽',direction:'into',stops:['cross','tower','water']},
 {name:'乙',route:'鉄塔 → 給水槽 → 小屋',direction:'into',stops:['tower','water','shed']},
 {name:'丙',route:'給水槽 → 鉄塔 → 踏切',direction:'away',stops:['water','tower','cross']},
 {name:'丁',route:'白沢 → トンネル → 小屋',direction:'into',stops:['home','tunnel','shed']},
];
export const rowForJourney=(direction:'into'|'away'):0|1=>direction==='into'?0:1;
