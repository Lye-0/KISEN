/** Ink drawing used only on paper records, never as an overlay on scenery. */
export function SurveyPost({ bands, x, y, scale = 1 }: { bands: 1 | 2; x: number; y: number; scale?: number }) {
    return <g transform={`translate(${x} ${y}) scale(${scale})`} aria-hidden="true">
        <path d="M-12 0L-8 -6H8L12 0V67H-12Z" fill={bands === 1 ? '#e3d9be' : '#4c4d41'} stroke="#555344" strokeWidth="2"/>
        {(bands === 1 ? [20] : [17, 31]).map(at => <path key={at} d={`M-11 ${at}H11`} stroke={bands === 1 ? '#555344' : '#dfd6bc'} strokeWidth="5"/>)}
        <path d="M-18 68H18" stroke="#555344" strokeWidth="2"/>
    </g>;
}
