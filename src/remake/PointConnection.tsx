import { cutPaths } from './ticketGeometry';
import { pointPorts } from './pointMechanics';
import type { Node } from './model';
const unknown = (node: Node, port: string) => node === 'C' && port === 'X' || node === 'E' && port === 'F' || node === 'F' && port === 'E';
export function PointConnection({ node, position }: {
    node: Node;
    position: number;
}) {
    const endpoints = node === 'E' ? [[110, 350], [690, 350], [400, 115]] : [[400, 430], [140, 110], [660, 110]];
    const pair = node === 'E' ? [[0, 1], [0, 2], [1, 2]][position] : [0, position + 1];
    return <svg viewBox="0 0 800 520" className="rm-point-connection" aria-label="操作札に描かれた三つの口とレバーの接触位置"><image href="/assets/remake/parts/photo-back.webp" width="800" height="520" preserveAspectRatio="none"/><text x="40" y="48" fontFamily="serif" fontSize="23" fill="#5e5844">分岐接触　{['Ⅰ', 'Ⅱ', 'Ⅲ'][position]}</text><g fill="none" stroke="#80765a" strokeWidth="8">{endpoints.map(([x, y], i) => <path key={i} d={`M${x} ${y}L400 275`}/>)}</g><path d={`M${endpoints[pair[0]].join(' ')}Q400 275 ${endpoints[pair[1]].join(' ')}`} fill="none" stroke="#41493e" strokeWidth="12"/>{pointPorts[node].map((port, i) => { const [x, y] = endpoints[i]; return <g key={port} transform={`translate(${x} ${y})`}><circle r="40" fill="#d1c6a8" stroke="#595b48" strokeWidth="2"/>{unknown(node, port) ? <text y="11" fontSize="37" textAnchor="middle" fontFamily="serif" fill="#555742">?</text> : ['S', 'R', 'O'].includes(port) ? <text y="9" textAnchor="middle" fill="#555742" fontFamily="serif" fontSize="23">{port === 'S' ? '駅' : port === 'R' ? '東' : '白沢'}</text> : <path d={cutPaths[port as Node]} transform="scale(1.3)" fill="#555742"/>}{unknown(node, port) && node !== 'F' && <text y={-55} textAnchor="middle" fontFamily="serif" fontSize="20" fill="#555742">{node === 'C' ? '高架側' : '庇側'}</text>}</g>; })}{node === 'A' && <g aria-label="駅側の一つの刻みの標柱" fill="#dad0b4" stroke="#595b48" strokeWidth="2"><path d="M456 294L462 287H473L478 294V390H456Z"/><path d="M456 323H478" strokeWidth="4"/><path d="M452 391H483" fill="none"/></g>}</svg>;
}
