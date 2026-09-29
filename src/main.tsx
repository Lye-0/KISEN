import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import RemakeApp from './remake/RemakeApp';
import './style.css';
createRoot(document.getElementById('root')!).render(<StrictMode>{new URLSearchParams(location.search).has('remake')?<RemakeApp/>:<App/>}</StrictMode>);

