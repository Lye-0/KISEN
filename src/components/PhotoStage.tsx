import { useEffect,useState } from 'react';
import type { ReactNode } from 'react';
const decoded=new Map<string,Promise<void>>();
export function preloadPhoto(src:string):Promise<void>{
 const cached=decoded.get(src);if(cached)return cached;
 const promise=new Promise<void>((resolve,reject)=>{const img=new Image();img.src=src;img.decode().then(()=>resolve(),()=>{decoded.delete(src);reject(new Error(`Image unavailable: ${src}`))})});decoded.set(src,promise);return promise;
}
export function PhotoStage({src,alt,children,className=''}:{src:string;alt:string;children?:ReactNode;className?:string}){
 const [ready,setReady]=useState('');const [error,setError]=useState(false);
 useEffect(()=>{let current=true;setError(false);preloadPhoto(src).then(()=>{if(current)setReady(src)},()=>{if(current)setError(true)});return()=>{current=false}},[src]);
 return <div className={`photo-stage ${className}`} aria-busy={ready!==src}><img src={ready||src} alt={alt}/>{ready===src?children:<div className="photo-pending">{error?'画像を読み込めません。画面を開き直してください。':'…'}</div>}</div>;
}
