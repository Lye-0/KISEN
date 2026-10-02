import { createContext, useContext, useEffect, useRef } from 'react';
export type RegisterSceneBack = (back: () => void, priority: number) => () => void;
export const SceneBackContext = createContext<RegisterSceneBack | null>(null);
/** A local enlargement consumes Back before the parent scene is closed. */
export function useSceneBack(active: boolean, back: () => void, priority = 20) {
    const register = useContext(SceneBackContext), latest = useRef(back);
    latest.current = back;
    useEffect(() => active && register ? register(() => latest.current(), priority) : undefined, [active, register, priority]);
}
