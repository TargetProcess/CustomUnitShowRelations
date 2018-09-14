import { extend } from 'underscore';

export interface ITausTrackData {
    name: string;
    masterEntityId?: number;
    slaveEntityId?: number;
    relationType?: string;
}

export default ({ name, masterEntityId, slaveEntityId, relationType }: ITausTrackData) => {
    if (!window.taus) {
        return;
    }

    const trackData = {
        name: `relations-${name}`,
        tags: ['relations']
    };

    masterEntityId && extend(trackData, { masterEntityId });
    slaveEntityId && extend(trackData, { slaveEntityId });
    relationType && extend(trackData, { relationType });
    window.taus.track(trackData);
};
