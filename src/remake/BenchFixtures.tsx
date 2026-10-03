import { useId } from 'react';
export function BenchStamp({ service, transform }: {
    service: number;
    transform?: string;
}) {
    return <g transform={transform}><image href="./assets/remake/parts/service-stamp.png" x="1175" y="0" width="190" height="280"/>
    <text x="1260" y="233" fontSize="32" fill="#433a29" textAnchor="middle" transform="rotate(12 1260 233)">{service}</text>
  </g>;
}
export function BenchFixtures({ die, service }: {
    die: number;
    service: number;
}) {
    const id = useId().replaceAll(':', '');
    return <>
    <defs>
      <clipPath id={id + 'rack'}><path d="M468 45H1094V225H466Z"/></clipPath>
      <clipPath id={id + 'slot'}><rect x={(28.3 + die * 5.88) * 16.72} y="37.64" width="102" height="113"/></clipPath>
      <clipPath id={id + 'paper'}><path d="M1439 149L1651 174L1644 348L1428 330Z"/></clipPath>
    </defs>
    <g clipPath={`url(#${id}rack)`}><image href="./assets/remake/ticket/bench.webp" width="1672" height="941"/>
      {die >= 0 && <image href="./assets/remake/ticket/empty-rack.webp" width="1672" height="941" clipPath={`url(#${id}slot)`}/>}
    </g>
    <image href="./assets/remake/ticket/bench.webp" width="1672" height="941" clipPath={`url(#${id}paper)`}/>
    <BenchStamp service={service}/>
  </>;
}
