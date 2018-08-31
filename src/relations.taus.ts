import { extend } from 'Underscore';

const doAction = (param: unknown, action: () => void) => {
    if (param) {
        action();
    }
};

export interface ITausTrackData {
    name: string;
    fromId?: string;
    toId?: string;
    relationType?: string;
}

export default ({ name, fromId, toId, relationType }: ITausTrackData) => {
    const trackData = {
        name: `relations-${name}`,
        tags: ['relations']
    };

    doAction(fromId, () => extend(trackData, { fromId }));
    doAction(toId, () => extend(trackData, { toId }));
    doAction(relationType, () => extend(trackData, { relationType }));

    if (window.taus) {
        window.taus.track(trackData);
    }
};
