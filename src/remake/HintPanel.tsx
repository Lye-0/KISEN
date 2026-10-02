import type { ProgressHint } from './progressHints';
export function HintPanel({ hint, level, onLevelChange }: { hint: ProgressHint; level: number; onLevelChange: (level: number) => void }) {
    const current = Math.max(0, Math.min(level, hint.clues.length - 1)), last = current === hint.clues.length - 1;
    const label = current === 0 ? '着眼点' : last ? hint.clues.length === 2 ? '具体的な操作' : '答えに近いヒント' : current === 1 ? '考え方' : current === 2 ? '絞り込み' : '解き方';
    return <div className="rm-hint-content">
        <p className="rm-hint-context">今の状況に合わせたヒント</p><h3>{hint.title}</h3>
        <div id="rm-hint-step" className="rm-hint-step" aria-live="polite" aria-atomic="true"><p className="rm-hint-progress">{current + 1} / {hint.clues.length}　{label}</p>
            <div className="rm-hint-detail">{hint.clues[current].split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
        </div>
        <nav className="rm-hint-actions" aria-label="ヒントの段階">
            {current > 0 && <button aria-controls="rm-hint-step" onClick={() => onLevelChange(current - 1)}>前のヒント</button>}
            {!last && <button aria-controls="rm-hint-step" onClick={() => onLevelChange(current + 1)}>{current === hint.clues.length - 2 ? hint.clues.length === 2 ? '具体的な操作を見る' : '最後のヒントを見る（答えに近い内容）' : '次のヒントを見る'}</button>}
        </nav><p className="rm-hint-footnote">必要な段階まで、ひとつずつ読めます。</p>
    </div>;
}
