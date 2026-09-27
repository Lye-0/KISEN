import {useEffect,useRef} from 'react';
import type {Room} from './model';
type Engine={context:AudioContext;rain:GainNode;rail:GainNode};
export function useAmbient(enabled:boolean,room:Room,ending:boolean){
 const engine=useRef<Engine|null>(null);
 useEffect(()=>{
  if(!enabled||ending)return;
  const context=new AudioContext();const rain=context.createGain(),rail=context.createGain();rain.gain.value=0;rail.gain.value=0;
  const buffer=context.createBuffer(1,context.sampleRate*6,context.sampleRate),data=buffer.getChannelData(0);let seed=927;
  for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296)*2-1}
  const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;
  const low=context.createBiquadFilter();low.type='lowpass';low.frequency.value=2200;
  const high=context.createBiquadFilter();high.type='highpass';high.frequency.value=320;
  noise.connect(low).connect(high).connect(rain).connect(context.destination);noise.start();
  const drone=context.createOscillator();drone.type='sine';drone.frequency.value=46;drone.connect(rail).connect(context.destination);drone.start();
  engine.current={context,rain,rail};void context.resume().catch(()=>{});
  return()=>{engine.current=null;noise.stop();drone.stop();void context.close()};
 },[enabled,ending]);
 useEffect(()=>{const e=engine.current;if(!e)return;const outside=['platform','forecourt','bridge','tunnel','closed'].includes(room);e.rain.gain.setTargetAtTime(outside?.07:.025,e.context.currentTime,.6);e.rail.gain.setTargetAtTime(room==='return'?.015:room==='train'?.004:0,e.context.currentTime,.8)},[enabled,ending,room]);
}
