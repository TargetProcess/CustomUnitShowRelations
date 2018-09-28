import { relationsConfigs, RelationType } from 'src/relations';
import * as _ from 'underscore';

export function getRelationTypeMarkerStartId(relationType: RelationType, hasViolations: boolean) {
    return `${relationType}${hasViolations ? '_violated' : ''}_start`;
}

export function getRelationTypeMarkerEndId(relationType: RelationType, hasViolations: boolean) {
    return `${relationType}${hasViolations ? '_violated' : ''}_outbound_end`;
}

export function getRelationTypeColor({ style }: any, hasViolations: boolean) {
    return hasViolations ? style.violatedColor : style.color;
}

export function getRelationColor(relationType: RelationType, hasViolations: boolean) {
    return getRelationTypeColor(_.find(relationsConfigs, ({ type }) => type === relationType), hasViolations);
}
