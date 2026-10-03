export function NumericLock({v,set}:{v:number[];set:(n:number[])=>void}){
 const change=(i:number,d:number)=>set(v.map((n,j)=>i===j?(n+d+10)%10:n));
 return <div className="numeric-lock"><div className="numeric-lock-photo"><img src="./assets/closeups/locks/numeric.webp" alt="木の面に取り付けられた四つの真鍮の数字輪"/><svg viewBox="0 0 1672 941" aria-hidden="true">{v.map((n,i)=><text key={i} x={[476,695,908,1121][i]} y="475" textAnchor="middle" fontSize="90" fontFamily="Georgia,serif" fill="#332714">{n}</text>)}</svg></div><div className="number-controls">{v.map((n,i)=><div key={i}><button aria-label={`${i+1}番の刻印を次へ`} onClick={()=>change(i,1)}>＋</button><span>{i+1}番</span><button aria-label={`${i+1}番の刻印を前へ`} onClick={()=>change(i,-1)}>−</button><output className="sr-only">{n}</output></div>)}</div></div>;
}
