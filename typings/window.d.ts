declare interface ITausTracker {
    track(data: any): void;
}

declare interface ITPLoggedUser {
    id: number;
}

// tslint:disable-next-line:interface-name
declare interface Window {
    taus?: ITausTracker;
    loggedUser?: ITPLoggedUser;
}
