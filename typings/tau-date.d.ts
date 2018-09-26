declare module 'tau/utils/utils.date' {
    export function parse(dateTimeString: string): { toDate(): Date } | null;
}
