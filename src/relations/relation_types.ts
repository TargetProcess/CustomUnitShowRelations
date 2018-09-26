import * as intl from 'tau-intl';

export interface IRelationConfig {
    label: string;
    type: RelationType;
    style: { color: string, violatedColor: string };
}

export enum RelationType {
    Dependency = 'Dependency',
    Blocker = 'Blocker',
    Relation = 'Relation',
    Link = 'Link',
    Duplicate = 'Duplicate'
}

export const relationsConfigs = [
    {
        label: intl.formatMessage('Dependencies'),
        type: RelationType.Dependency,
        style: { color: '#6abcd0', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Blockers'),
        type: RelationType.Blocker,
        style: { color: '#c30010', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Relations'),
        type: RelationType.Relation,
        style: { color: '#8e98a9', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Links'),
        type: RelationType.Link,
        style: { color: '#4d7fbe', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Duplicates'),
        type: RelationType.Duplicate,
        style: { color: '#e79010', violatedColor: '#f00' }
    }
] as IRelationConfig[];
