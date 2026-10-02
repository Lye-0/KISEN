export function DeskTabs({ active, disabled = false, change }: { active: 'tools' | 'ticket'; disabled?: boolean; change: (next: 'tools' | 'ticket') => void }) {
    return <nav className="rm-desk-tabs" aria-label="机の作業を切り替える">
        <button aria-pressed={active === 'tools'} disabled={disabled} onClick={() => change('tools')}>鋏を選ぶ・試す</button>
        <button aria-pressed={active === 'ticket'} disabled={disabled} onClick={() => change('ticket')}>切符を作る</button>
    </nav>;
}
