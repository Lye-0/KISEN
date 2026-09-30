import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
const root=createRoot(document.getElementById('root')!);
if(new URLSearchParams(location.search).has('legacy')){
 await import('./style.css');
 const {default:App}=await import('./App');
 root.render(<StrictMode><App/></StrictMode>);
}else{
 const {default:RemakeApp}=await import('./remake/RemakeApp');
 root.render(<StrictMode><RemakeApp/></StrictMode>);
}
