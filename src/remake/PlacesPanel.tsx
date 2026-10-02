import { roomLabels, visitedPlaces } from './visitedPlaces';
import type { Room, State } from './model';

export function PlacesPanel({ s, travel }: { s: State; travel: (room: Room) => void }) {
    return <div className="rm-places-content">
        <p>訪れた場所へ移動する。</p>
        <ul className="rm-places-list">{visitedPlaces(s).map(place => <li key={place.room}>
            <button disabled={place.current || !place.reachable} aria-current={place.current ? 'location' : undefined} onClick={() => travel(place.room)}>
                <span>{roomLabels[place.room]}</span>
                <span className="rm-place-status">{place.current ? '現在地' : place.reachable ? '移動する' : '今は移動できない'}</span>
            </button>
        </li>)}</ul>
    </div>;
}
