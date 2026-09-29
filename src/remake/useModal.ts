import { useEffect, useRef } from 'react';
export function useModal(open: boolean, close: () => void) {
    const ref = useRef<HTMLDivElement>(null), closeRef = useRef(close);
    closeRef.current = close;
    useEffect(() => {
        if (!open)
            return;
        const previous = document.activeElement as HTMLElement | null;
        const root = ref.current;
        if (!root)
            return;
        const controls = () => Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"],input:not(:disabled),select:not(:disabled)')).filter(e => e.getClientRects().length > 0);
        controls()[0]?.focus();
        const key = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                closeRef.current();
            }
            if (e.key === 'Tab') {
                const a = controls(), first = a[0], last = a.at(-1);
                if (!first) {
                    e.preventDefault();
                    return;
                }
                if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
                    e.preventDefault();
                    last?.focus();
                }
                else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', key, true);
        return () => {
            document.removeEventListener('keydown', key, true);
            if (previous?.isConnected)
                previous.focus();
        };
    }, [open]);
    return ref;
}
