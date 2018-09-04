import { extend } from 'underscore';

export interface ITausTrackData {
    name: string;
    mainEntityId?: number;
    slaveEntityId?: number;
    relationType?: string;
}

export default ({ name, mainEntityId, slaveEntityId, relationType }: ITausTrackData) => {
    if (!window.taus) {
        return;
    }

    const trackData = {
        name: `relations-${name}`,
        tags: ['relations']
    };

    mainEntityId && extend(trackData, { mainEntityId });
    slaveEntityId && extend(trackData, { slaveEntityId });
    relationType && extend(trackData, { relationType });
    window.taus.track(trackData);
};
