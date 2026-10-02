import { useState } from 'react';
import type { ProgressHint } from './progressHints';

export function HintPanel({ hint }: { hint: ProgressHint }) {
    const [expanded, setExpanded] = useState(false);
    return <div className="rm-hint-content">
        <p className="rm-hint-context">今の状況に合わせたヒント</p>
        <h3>{hint.title}</h3>
        <p>{hint.clues[0]}</p>
        {expanded && <div id="rm-hint-detail" className="rm-hint-detail" role="status">{hint.clues[1].split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>}
        <button aria-expanded={expanded} aria-controls={expanded ? 'rm-hint-detail' : undefined} onClick={() => setExpanded(!expanded)}>{expanded ? '詳しいヒントを閉じる' : '考え方と操作を見る'}</button>
        <p className="rm-hint-footnote">進行に合わせて、ヒントの内容も変わります。</p>
    </div>;
}
