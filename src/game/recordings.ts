export const tapeEvents=['扉閉','列車通過','ベル','停止'];
export function recordOrderMatches(values:number[]){return values.length===5&&values.slice(1).every((n,i)=>n===i);}
// Clock numbers are not used to force the worksheet state. The physical lock reads only the event order.
export const recordingLandmarks={A:[{at:6,pulses:2},{at:18,pulses:1}],B:[{at:2,pulses:2},{at:14,pulses:1}]};
export function plausibleTapeOffsets(){
 const result:number[]=[];
 for(let shift=-12;shift<=18;shift++){
  let compared=0,bad=false;
  for(const event of recordingLandmarks.B){const absolute=event.at+shift;if(absolute<0||absolute>21)continue;const match=recordingLandmarks.A.find(e=>e.at===absolute);if(!match||match.pulses!==event.pulses){bad=true;break}compared++;}
  if(!bad&&compared>0)result.push(shift);
 }
 return result;
}
