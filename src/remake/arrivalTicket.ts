import { entrySide } from './model';
import type { Node, Ticket } from './model';
/** The physical ticket already lying on the carriage floor when play starts. */
const visited: Node[] = ['F', 'E', 'B', 'A'];
const route = ['R', ...visited];
export const arrivalTicket: Ticket = {
    id: 1,
    holes: visited.map((node, column) => ({ node, column, side: entrySide[route[column] + '>' + node], tool: 1 })),
    service: 0,
    back: false,
};
