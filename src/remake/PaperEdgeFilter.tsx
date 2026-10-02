/** Relief comes from the cut paper's alpha, so overlapping cuts keep one rim. */
export function PaperEdgeFilter({ id }: { id: string }) {
    return <filter id={id} x="-10%" y="-15%" width="120%" height="130%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="-.65" stdDeviation=".18" floodColor="#fff8df" floodOpacity=".95"/>
        <feDropShadow dx=".6" dy="1.3" stdDeviation=".65" floodColor="#463621" floodOpacity=".65"/>
    </filter>;
}
