import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
export function Surface({ children }: {
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null), [scale, setScale] = useState(1);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const observer = new ResizeObserver(entries => setScale(entries[0].contentRect.width / 1672));
        observer.observe(el);
        setScale(el.clientWidth / 1672);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} className="rm-native-surface"><div style={{ width: 1672, height: 941, transform: `scale(${scale})`, transformOrigin: '0 0' }}>{children}</div></div>;
}
