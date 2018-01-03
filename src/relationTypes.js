import * as intl from 'tau-intl';

export default [
    {
        label: intl.formatMessage('Dependencies'),
        name: 'Dependency',
        style: {color: '#6abcd0'}
    },
    {
        label: intl.formatMessage('Blockers'),
        name: 'Blocker',
        style: {color: '#c30010'}
    },
    {
        label: intl.formatMessage('Relations'),
        name: 'Relation',
        style: {color: '#8e98a9'}
    },
    {
        label: intl.formatMessage('Links'),
        name: 'Link',
        style: {color: '#4d7fbe'}
    },
    {
        label: intl.formatMessage('Duplicates'),
        name: 'Duplicate',
        style: {color: '#e79010'}
    }
];
