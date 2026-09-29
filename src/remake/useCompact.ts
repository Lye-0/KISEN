import { useEffect, useState } from 'react';
export function useCompact() { const [compact, setCompact] = useState(() => matchMedia('(max-width:600px)').matches); useEffect(() => { const q = matchMedia('(max-width:600px)'), update = () => setCompact(q.matches); q.addEventListener('change', update); return () => q.removeEventListener('change', update); }, []); return compact; }
