import { useId } from 'react';
import { Surface } from './Surface';
import { planeMatrix } from './plane';
import { TrialSheet } from './ToolTrial';
import { owns } from './model';
import type { State } from './model';
const silhouettes = [
    'M795 627L824 630L846 636L873 641Q889 648 885 660L869 663L838 654L825 648L798 644Z',
    'M881 628L908 631L931 638L964 643Q981 651 976 662L963 664L931 655L908 648L883 645Z',
    'M976 629L1003 631L1027 638L1062 645Q1078 652 1074 663L1061 665L1028 655L1003 648L979 645Z',
];
const matrix = planeMatrix(1080, 300, [[845, 662], [1077, 662], [1085, 676], [840, 676]]);
export function ToolScene({ s }: {
    s: State;
}) {
    const id = useId().replaceAll(':', '');
    const tool = owns(s, 'punch') ? s.values.punchTool?.[0] ?? 1 : -1;
    const die = s.values.ticketDie?.[0], centres = [863, 885, 908, 931, 953, 976];
    return <>
    <svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs>
      <clipPath id={id + 'paper'}><path d="M842 660H1080L1089 679H837Z"/></clipPath>
      {tool >= 0 && <clipPath id={id + 'tool'}><path d={silhouettes[tool]}/></clipPath>}
      {die !== undefined && <clipPath id={id + 'die'}><rect x={centres[die] - 9} y="595" width="18" height="22"/></clipPath>}
    </defs>
      <image href="/assets/remake/office/desk-clear.webp" width="1672" height="941" clipPath={`url(#${id}paper)`}/>
      {tool >= 0 && <image href="/assets/remake/office/desk-clear.webp" width="1672" height="941" clipPath={`url(#${id}tool)`}/>}
      {die !== undefined && <><image href="/assets/remake/office/desk-clear.webp" width="1672" height="941" clipPath={`url(#${id}die)`}/>
        <svg x={centres[die] - 8} y="601" width="16" height="18" viewBox="854 600 29 23" preserveAspectRatio="none"><image href="/assets/remake/office/socket-source.webp" width="1672" height="941"/></svg></>}
      <text x="1028" y="633" fontSize="4" fill="#42382b" textAnchor="middle">{s.values.stampSetting?.[0] ?? 1}</text>
    </svg>
    <Surface><div className="rm-world-trial-paper" style={{ width: 1080, height: 300, transform: `matrix3d(${matrix.join(',')})` }}><TrialSheet cuts={s.values.toolCuts ?? []}/></div></Surface>
  </>;
}
