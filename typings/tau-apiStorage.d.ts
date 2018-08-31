declare module 'tau/storage/api.nocache' {
    export default class RestStorage {
        public data(groupName: string, key: string, data: object): void;
        public select(groupName: string, query: object): Promise<any>;
    }
}
