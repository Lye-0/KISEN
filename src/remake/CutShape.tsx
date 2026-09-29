import { useId } from 'react';
import { cutPaths } from './ticketGeometry';
import type { PhysicalCut } from './ticketGeometry';
// The paper mask and loose chads use the same physical cutting footprint.
export function CutShape({ cut, fill }: {
    cut: PhysicalCut;
    fill: string;
}) {
    const id = useId().replaceAll(':', '');
    return <g fill={fill}>
    {cut.tool === 0 && <defs><clipPath id={id}>
      <rect x="-30" y="-30" width="60" height="30"/>
      <rect x="-30" y="0" width="27" height="30"/>
      <rect x="3" y="0" width="27" height="30"/>
    </clipPath></defs>}
    <path d={cutPaths[cut.node]} clipPath={cut.tool === 0 ? `url(#${id})` : undefined}/>
    {cut.tool === 2 && <path d={cutPaths[cut.node]} transform="translate(5 0)"/>}
  </g>;
}
