import { useId } from 'react';

// Face, numerals, minute ticks and hands share one projection.
export function ClockHands({ minutes = 23 * 60 + 12, transform = 'translate(198 251) rotate(-3) scale(.62 1)', ambient = false }: {
    minutes?: number;
    transform?: string;
    ambient?: boolean;
}) {
    const id = useId().replaceAll(':', ''), minute = minutes % 60, hour = (minutes / 60) % 12;
    return <g transform={transform} style={ambient ? { filter: 'brightness(.67) saturate(.45) blur(.25px)' } : undefined}>
        <defs>
            <radialGradient id={id + 'face'} cx=".36" cy=".28" r=".8"><stop stopColor="#969b8a"/><stop offset=".65" stopColor="#868c7d"/><stop offset="1" stopColor="#626b60"/></radialGradient>
            <linearGradient id={id + 'rim'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#747b70"/><stop offset=".25" stopColor="#444e45"/><stop offset="1" stopColor="#242d29"/></linearGradient>
            <radialGradient id={id + 'shade'}><stop offset=".72" stopColor="#0d1713" stopOpacity="0"/><stop offset=".94" stopColor="#0d1713" stopOpacity=".16"/><stop offset="1" stopColor="#0d1713" stopOpacity=".45"/></radialGradient>
            <filter id={id + 'grain'} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".38" numOctaves="3" seed="7" result="noise"/>
                <feColorMatrix in="noise" type="saturate" values="0"/>
                <feComponentTransfer result="texture"><feFuncR type="linear" slope=".22" intercept=".39"/><feFuncG type="linear" slope=".22" intercept=".39"/><feFuncB type="linear" slope=".22" intercept=".39"/></feComponentTransfer>
                <feBlend in="SourceGraphic" in2="texture" mode="soft-light" result="surface"/><feComposite in="surface" in2="SourceGraphic" operator="in"/>
            </filter>
        </defs>
        <circle r="77" fill={'url(#' + id + 'rim)'} stroke="#27312b" strokeWidth="1.2"/>
        <circle r="74" fill={'url(#' + id + 'face)'} filter={'url(#' + id + 'grain)'}/>
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={'M0 -' + (i % 5 ? 67 : 63) + 'V-72'} transform={'rotate(' + i * 6 + ')'} fill="none" stroke="#282f29" strokeWidth={i % 5 ? 1.1 : 2}/>)}
        {Array.from({ length: 12 }, (_, i) => { const angle = (i + 1) * Math.PI / 6; return <text key={i} x={Math.sin(angle) * 53} y={-Math.cos(angle) * 53 + 4} fontFamily="serif" fontSize="13" textAnchor="middle" fill="#283029">{i + 1}</text>; })}
        <path d="M-2.5 8L-2.5 -30L0 -43L2.5 -30L2.5 8Z" transform={'rotate(' + hour * 30 + ')'} fill="#282d27" stroke="#b7baa4" strokeWidth=".5"/>
        <path d="M-1.8 8L-1.8 -57L0 -69L1.8 -57L1.8 8Z" transform={'rotate(' + minute * 6 + ')'} fill="#242b27" stroke="#cbd0b9" strokeWidth=".6"/>
        <circle r="3.5" fill="#7d8068" stroke="#30382c" strokeWidth=".6"/>
        <circle r="74" fill={'url(#' + id + 'shade)'} pointerEvents="none"/>
    </g>;
}
export function Clock({ minutes = 23 * 60 + 12, transform = 'translate(198 251) rotate(-3) scale(.62 1)', ambient = false }: {
    minutes?: number;
    transform?: string;
    ambient?: boolean;
}) {
    return <svg className="rm-clock" viewBox="0 0 1672 941" aria-label={'時計、' + Math.floor(minutes / 60) + '時' + minutes % 60 + '分'} role="img"><ClockHands minutes={minutes} transform={transform} ambient={ambient}/></svg>;
}
