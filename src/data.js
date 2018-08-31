import $ from 'jquery';
import _ from 'underscore';
import * as globalBus from 'tau/core/global.bus';
import relationTypes from './relationTypes';
import globalConfigurator from 'tau/configurator';

const loadSimple = (url, params) =>
    $.ajax({
        type: 'get',
        url: url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

const loadPages = (url, params) =>
    loadSimple(url, params)
        .then(({Items, Next}) =>
            (Next ? (loadPages(Next).then((pageItems) => Items.concat(pageItems))) : Items));

const load = (resource, params) =>
    loadPages(`${globalConfigurator.getApplicationPath()}/api/v1/${resource}`, params);

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

let store = null;
const onStoreChanged = _.Callbacks();

globalBus.get().on('configurator.ready', (e, configurator) => {
    if (!store) {
        store = configurator.storeFactory.getStore();
    } else {
        const newStore = configurator.storeFactory.getStore();

        if (store.id !== newStore.id) {
            store = newStore;
            onStoreChanged.fire();
        }
    }
});

export default class RelationsData {
    constructor() {
        this.entityIds = [];
        this._relations = [];
        this.setFilterConfig([]);
        this.updated = _.Callbacks();
        onStoreChanged.add(() => this.subscribeForRelationsUpdate());
        this.subscribeForRelationsUpdate();
    }

    load(entityIds) {
        if (_.intersection(entityIds, this.entityIds).length === entityIds.length) {
            return Promise.resolve(this.getRelationsFiltered());
        }
            this.entityIds = entityIds;
            return this._getRelationsByIdsInternal(entityIds).then((relations) => this._relations = relations)
                .then(() => this.getRelationsFiltered());
    }

    refresh() {
        return this._getRelationsByIdsInternal(this._relations.map((r) => r.entity.id));
    }

    setFilterConfig(config) {
        this.filterConfig = config.filter((c) => c.show)
            .map((relationType) => relationTypes.filter((r) => r.name === relationType.name)[0].name);
    }

    getRelationsFiltered() {
        return this._relations.filter((r) => this.filterConfig.some((c) => c === r.relationType.name));
    }

    getRelationsByIds(entityIds) {
        return this._relations.filter((r) => entityIds.some(r.entity.id));
    }

    _onRelationsChanged() {
        this._getRelationsByIdsInternal(this.entityIds).then((relations) => {
            this._relations = relations;
            this.updated.fire();
        });
    }

    subscribeForRelationsUpdate() {
        if (this.store) {
            this.store.unbind(this);
        }
        this.store = store;
        this.store.on({
            type: 'relation',
            eventName: 'afterSave',
            listener: this
        }, () => {
            this._onRelationsChanged();
        }, this);

        this.store.on({
            type: 'relation',
            eventName: 'afterRemove',
            listener: this
        }, () => {
            this._onRelationsChanged();
        }, this);
    }

    _getRelationsByIdsInternal(entityIds) {
        if (!entityIds.length) {
            return Promise.resolve([]);
        }

        return load('relations', {
            where: `Master.Id in (${entityIds.join(',')})`,
            include: `[Slave[Id],Master[Id],RelationType[Name]]`
        })
            .then((items) =>
                items.map((v) => processItem(v, 'Slave', 'outbound'))
        )
            .fail(() => {
                console.warn('Error loading relations for Relation Visualisation');
                return [];
            });
    }
}

