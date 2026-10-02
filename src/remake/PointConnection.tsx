import { cutPaths } from './ticketGeometry';
import { pointPorts, pointNames, physicalRailContacts } from './pointMechanics';
import type { Node } from './model';
const unknown = (node: Node, port: string) => node === 'C' && port === 'X' || node === 'E' && port === 'F' || node === 'F' && port === 'E';
const portName = (node: Node, port: string) => unknown(node, port) ? '未確認の接続先' : port === 'S' ? '駅' : port === 'R' ? '東線' : port === 'O' ? '白沢側' : pointNames[port as Node] + 'の分岐';
export function PointConnection({ node, position }: { node: Node; position: number }) {
    const endpoints = node === 'E' ? [[110, 390], [690, 390], [400, 145]] : [[400, 420], [140, 150], [660, 150]];
    const connected = physicalRailContacts(node, position)[0];
    const ports = pointPorts[node];
    const [a, b] = connected.map(port => endpoints[ports.indexOf(port)]);
    const label = `${pointNames[node]}の分岐。位置${['Ⅰ', 'Ⅱ', 'Ⅲ'][position]}。${portName(node, connected[0])}と${portName(node, connected[1])}が、この分岐を通ってつながっている。`;
    return <svg viewBox="0 0 800 520" className="rm-point-connection" role="img" aria-label={label}>
        <image href="/assets/remake/parts/photo-back.webp" width="800" height="520" preserveAspectRatio="none"/>
        <g fontFamily="serif" fill="#514d3c">
            <path d={cutPaths[node]} transform="translate(52 37) scale(.85)"/>
            <text x="83" y="46" fontSize="27">分岐</text>
            <text x="752" y="46" textAnchor="end" fontSize="24">{['Ⅰ', 'Ⅱ', 'Ⅲ'][position]}</text>
        </g>
        <g fill="none" stroke="#94896d" strokeWidth="7">{endpoints.map(([x, y], i) => <path key={i} d={`M${x} ${y}L400 290`}/>)}</g>
        <path d={`M${a.join(' ')}L400 290L${b.join(' ')}`} fill="none" stroke="#41493e" strokeWidth="13" strokeLinejoin="round"/>
        {ports.map((port, i) => { const [x, y] = endpoints[i]; return <g key={port} transform={`translate(${x} ${y})`}>
            <circle r="40" fill="#d1c6a8" stroke="#595b48" strokeWidth="2"/>
            {unknown(node, port) ? <text y="11" fontSize="37" textAnchor="middle" fontFamily="serif" fill="#555742">?</text> : ['S', 'R', 'O'].includes(port) ? <text y="9" textAnchor="middle" fill="#555742" fontFamily="serif" fontSize="23">{port === 'S' ? '駅' : port === 'R' ? '東' : '白沢'}</text> : <path d={cutPaths[port as Node]} transform="scale(1.3)" fill="#555742"/>}
            {unknown(node, port) && node !== 'F' && <text y="65" textAnchor="middle" fontFamily="serif" fontSize="20" fill="#555742">{node === 'C' ? '高架側' : '庇側'}</text>}
        </g>; })}
        <g aria-label="このレバーが操作する分岐" transform="translate(400 290)">
            <circle r="44" fill="#e8d8b6" stroke="#41493e" strokeWidth="3"/>
            <path d={cutPaths[node]} transform="scale(1.5)" fill="#41493e"/>

        </g>
        {node === 'A' && <g aria-label="駅側の一つの刻みの標柱" fill="#dad0b4" stroke="#595b48" strokeWidth="2"><path d="M456 304L462 297H473L478 304V400H456Z"/><path d="M456 333H478" strokeWidth="4"/><path d="M452 401H483" fill="none"/></g>}
    </svg>;
}
