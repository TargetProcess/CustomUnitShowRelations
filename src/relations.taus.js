import {extend} from 'Underscore';

const doAction = (param, action) => {
    if (param) {
        action();
    }
};

export default ({name, fromId, toId, relationType}) => {
    const trackData = {
        name: `relations-${name}`,
        tags: ['relations']
    };

    doAction(fromId, () => extend(trackData, {fromId}));
    doAction(toId, () => extend(trackData, {toId}));
    doAction(relationType, () => extend(trackData, {relationType}));

    if (window.taus) {
        window.taus.track(trackData);
    }
};
