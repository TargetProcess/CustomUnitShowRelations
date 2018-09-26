declare module 'tau/api/board/v1' {
    export function onBoardCreate(callback: (board: any) => void): void;
    export function onDetailsCreate(callback: (board: any) => void): void;
    export function onListCreate(callback: (board: any) => void): void;
    export function onTimelineCreate(callback: (board: any) => void): void;
}
