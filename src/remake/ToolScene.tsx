import { useId } from 'react';
import { Surface } from './Surface';
import { planeMatrix } from './plane';
import { TrialSheet } from './ToolTrial';
import type { State } from './model';
const matrix = planeMatrix(1080, 300, [[845, 662], [1077, 662], [1085, 676], [840, 676]]);
export function ToolScene({ s }: {
    s: State;
}) {
    const id = useId().replaceAll(':', '');
    const die = s.values.ticketDie?.[0], centres = [863, 885, 908, 931, 953, 976];
    return <>
    <svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs>
      <clipPath id={id + 'paper'}><path d="M842 660H1080L1089 679H837Z"/></clipPath>
      {die !== undefined && <clipPath id={id + 'die'}><rect x={centres[die] - 9} y="595" width="18" height="22"/></clipPath>}
    </defs>
      <image href="/assets/remake/office/desk-clear.webp" width="1672" height="941" clipPath={`url(#${id}paper)`}/>
      {die !== undefined && <><image href="/assets/remake/office/desk-clear.webp" width="1672" height="941" clipPath={`url(#${id}die)`}/>
        <svg x={centres[die] - 8} y="601" width="16" height="18" viewBox="854 600 29 23" preserveAspectRatio="none"><image href="/assets/remake/office/socket-source.webp" width="1672" height="941"/></svg></>}
      <text x="1028" y="633" fontSize="4" fill="#42382b" textAnchor="middle">{s.values.stampSetting?.[0] ?? 1}</text>
    </svg>
    <Surface><div className="rm-world-trial-paper" style={{ width: 1080, height: 300, transform: `matrix3d(${matrix.join(',')})` }}><TrialSheet cuts={s.values.toolCuts ?? []}/></div></Surface>
  </>;
}
