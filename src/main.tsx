import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import RemakeApp from './remake/RemakeApp';

createRoot(document.getElementById('root')!).render(<StrictMode><RemakeApp/></StrictMode>);
