import * as intl from 'tau-intl';

export interface IRelationType {
    label: string;
    name: string;
    style: { color: string, violatedColor: string };
}

export default [
    {
        label: intl.formatMessage('Dependencies'),
        name: 'Dependency',
        style: { color: '#6abcd0', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Blockers'),
        name: 'Blocker',
        style: { color: '#c30010', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Relations'),
        name: 'Relation',
        style: { color: '#8e98a9', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Links'),
        name: 'Link',
        style: { color: '#4d7fbe', violatedColor: '#f00' }
    },
    {
        label: intl.formatMessage('Duplicates'),
        name: 'Duplicate',
        style: { color: '#e79010', violatedColor: '#f00' }
    }
] as IRelationType[];
