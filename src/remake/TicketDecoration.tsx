/** Shared printed stock for complete tickets and their partial copies. */
export function TicketDecoration({ id, width = 800, height = 235 }: { id: string; width?: number; height?: number }) {
    return <>
        <defs><pattern id={id + 'security'} width="32" height="18" patternUnits="userSpaceOnUse"><path d="M-16 9Q0-8 16 9T48 9M-16 18Q0 1 16 18T48 18M-16 0Q0-17 16 0T48 0" fill="none" stroke="#8c805f" strokeWidth=".45" opacity=".32"/></pattern></defs>
        <rect width={width} height={height} fill={`url(#${id}security)`}/>
        <rect x="8" y="7" width={width - 16} height={height - 14} rx="3" fill="none" stroke="#93734e" strokeWidth="1.2"/>
        <rect x="12" y="11" width={width - 24} height={height - 22} rx="2" fill="none" stroke="#93734e" strokeWidth=".45"/>
    </>;
}
