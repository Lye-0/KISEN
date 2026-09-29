import { useEffect, useRef, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
const cache = new Map<string, Promise<void>>();
export function decode(src: string) {
    let p = cache.get(src);
    if (!p) {
        p = new Promise<void>((resolve, reject) => { const im = new Image(); im.src = src; im.decode().then(resolve, reject); });
        cache.set(src, p);
    }
    return p;
}
export function Photo({ src, label, children, zoomable = false, view }: {
    src: string;
    label: string;
    children?: ReactNode;
    zoomable?: boolean;
    view?: [
        number,
        number,
        number,
        number
    ];
}) {
    const [loaded, setLoaded] = useState(''), [error, setError] = useState(false);
    const [zoom, setZoom] = useState(false), [origin, setOrigin] = useState('50% 50%');
    useEffect(() => {
        let active = true;
        setError(false);
        setZoom(false);
        decode(src).then(() => {
            if (active)
                setLoaded(src);
        }, () => {
            if (active)
                setError(true);
        });
        return () => { active = false; };
    }, [src]);
    const [x, y, w, h] = view ?? [0, 0, 1672, 941];
    return <div className="rm-photo" aria-busy={loaded !== src} style={{ aspectRatio: `${w}/${h}`, maxWidth: view ? `calc(100dvh * ${w / h})` : undefined }}><div className="rm-photo-content" style={{ left: `${-x / w * 100}%`, top: `${-y / h * 100}%`, width: `${1672 / w * 100}%`, height: `${941 / h * 100}%`, transform: zoom ? 'scale(2.7)' : undefined, transformOrigin: origin }}><img src={loaded || src} alt={label} draggable={false}/>{loaded === src && children}</div>{loaded === src ? <>{zoomable && <button className="rm-photo-zoom" aria-label={zoom ? '写真の全体を見る' : '写真を拡大する'} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(e.detail === 0 ? '50% 50%' : `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`); setZoom(!zoom); }}><span aria-hidden="true">{zoom ? '−' : '＋'}</span></button>}</> : <div className="rm-loading" role="status">{error ? '画像を読み込めません。再読み込みしてください。' : '…'}</div>}</div>;
}
export function Patch({ src, rect }: {
    src: string;
    rect: [
        number,
        number,
        number,
        number
    ];
}) { const [x, y, w, h] = rect; return <img className="rm-patch" src={src} draggable={false} alt="" aria-hidden="true" style={{ clipPath: `inset(${y}% ${100 - x - w}% ${100 - y - h}% ${x}%)` }}/>; }
export function Touch({ name, rect, act, drag, className = '', style }: {
    name: string;
    rect: [
        number,
        number,
        number,
        number
    ];
    act: () => void;
    drag?: (dx: number, dy: number) => void;
    className?: string;
    style?: CSSProperties;
}) {
    const origin = useRef<[
        number,
        number
    ] | null>(null), moved = useRef(false);
    const [x, y, w, h] = rect;
    return <button className={`rm-touch ${drag ? 'rm-drag-target' : ''} ${className}`} aria-label={name} style={{ left: x + '%', top: y + '%', width: w + '%', height: h + '%', ...style }} onPointerDown={e => {
            origin.current = [e.clientX, e.clientY];
            moved.current = false;
            if (drag)
                e.currentTarget.setPointerCapture(e.pointerId);
        }} onPointerUp={e => {
            if (!origin.current)
                return;
            const dx = e.clientX - origin.current[0], dy = e.clientY - origin.current[1];
            if (drag && Math.hypot(dx, dy) > 12) {
                moved.current = true;
                drag(dx, dy);
            }
            origin.current = null;
        }} onPointerCancel={() => { origin.current = null; moved.current = false; }} onClick={() => {
            if (moved.current) {
                moved.current = false;
                return;
            }
            act();
        }}><span>{name}</span></button>;
}
