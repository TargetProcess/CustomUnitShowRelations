declare module 'tau/core/global.bus' {
    export function get(): { on: (eventName: string, callback: (event: any, payload: any) => void) => void };
}
