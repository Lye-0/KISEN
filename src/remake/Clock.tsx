export function Clock({ minutes = 23 * 60 + 12 }: {
    minutes?: number;
}) {
    const minute = minutes % 60, hour = (minutes / 60) % 12;
    return <svg className="rm-clock" viewBox="0 0 1672 941" aria-label={`時計、${Math.floor(minutes / 60)}時${minute}分`} role="img"><g transform="translate(198 251) rotate(-3) scale(.62 1)" fill="#282219" stroke="#30291c" strokeWidth=".7"><path d="M-2 7L-2 -34L0 -44L2 -34L2 7Z" transform={`rotate(${hour * 30})`}/><path d="M-1.3 7L-1.3 -50L0 -62L1.3 -50L1.3 7Z" transform={`rotate(${minute * 6})`}/><circle r="4" fill="#70562b"/></g></svg>;
}
