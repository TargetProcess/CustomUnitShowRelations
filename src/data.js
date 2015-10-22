import $ from 'jquery';
import tsml from 'tsml';

import configurator from 'tau/configurator';

export const getRelationsById = (entityId) => {

    const processItem = (item, type, directionType) => ({
        directionType,
        relationType: {
            name: item.RelationType.Name
        },
        entity: {
            id: item[type].Id
        }
    });

    return $.ajax({
        url: tsml`${configurator.getApplicationPath()}/api/v1/generals/${entityId}?
            include=[MasterRelations[Master,RelationType],SlaveRelations[Slave,RelationType]]&
            format=json`,
        contentType: 'application/json; charset=utf-8'
    })
    .then((res) =>
        res.MasterRelations.Items.map((v) => processItem(v, 'Master', 'inbound'))
            .concat(res.SlaveRelations.Items.map((v) => processItem(v, 'Slave', 'outbound')))
    )
    .fail(() => []);

};

export const getRelationsByIds = (entityIds) => {

    if (!entityIds.length) return [];

    const processItem = (item, type, directionType) => ({
        directionType,
        relationType: {
            name: item.RelationType.Name
        },
        entity: {
            id: item[type].Id
        },
        main: {
            id: item.Master.Id
        }
    });

    return $.ajax({
        url: tsml`${configurator.getApplicationPath()}/api/v1/relations?
            where=Master.Id in (${entityIds.join(',')})&
            include=[Slave[Id],Master[Id],RelationType[Name]]&
            format=json`,
        contentType: 'application/json; charset=utf-8'
    })
    .then((res) =>
        res.Items.map((v) => processItem(v, 'Slave', 'outbound'))
    )
    .fail(() => []);

};
