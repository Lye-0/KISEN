import { useId } from 'react';

// Face, numerals, minute ticks and hands share one projection.
export function ClockHands({ minutes = 23 * 60 + 12, transform = 'translate(198 251) rotate(-3) scale(.62 1)' }: {
    minutes?: number;
    transform?: string;
}) {
    const id = useId().replaceAll(':', ''), minute = minutes % 60, hour = (minutes / 60) % 12;
    return <g transform={transform}>
        <defs><radialGradient id={id + 'face'} cx=".4" cy=".35"><stop stopColor="#a69c87"/><stop offset="1" stopColor="#796f5d"/></radialGradient><pattern id={id + 'grain'} width="150" height="150" patternUnits="userSpaceOnUse"><image href="/assets/remake/parts/photo-back.webp" width="150" height="150"/></pattern></defs>
        <circle r="76" fill={'url(#' + id + 'face)'} stroke="#393b32" strokeWidth="2"/>
        <circle r="74" fill={'url(#' + id + 'grain)'} opacity=".12"/>
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={'M0 -' + (i % 5 ? 67 : 63) + 'V-72'} transform={'rotate(' + i * 6 + ')'} fill="none" stroke="#282c27" strokeWidth={i % 5 ? 1.1 : 2}/>)}
        {Array.from({ length: 12 }, (_, i) => { const angle = (i + 1) * Math.PI / 6; return <text key={i} x={Math.sin(angle) * 53} y={-Math.cos(angle) * 53 + 4} fontFamily="serif" fontSize="13" textAnchor="middle" fill="#252b26">{i + 1}</text>; })}
        <path d="M-2.5 8L-2.5 -30L0 -43L2.5 -30L2.5 8Z" transform={'rotate(' + hour * 30 + ')'} fill="#282d27" stroke="#c1b391" strokeWidth=".5"/>
        <path d="M-1.8 8L-1.8 -57L0 -69L1.8 -57L1.8 8Z" transform={'rotate(' + minute * 6 + ')'} fill="#242b27" stroke="#d8c7a3" strokeWidth=".6"/>
        <circle r="3.5" fill="#85714b" stroke="#302f26" strokeWidth=".6"/>
    </g>;
}
export function Clock({ minutes = 23 * 60 + 12, transform = 'translate(198 251) rotate(-3) scale(.62 1)' }: {
    minutes?: number;
    transform?: string;
}) {
    return <svg className="rm-clock" viewBox="0 0 1672 941" aria-label={'時計、' + Math.floor(minutes / 60) + '時' + minutes % 60 + '分'} role="img"><ClockHands minutes={minutes} transform={transform}/></svg>;
}
