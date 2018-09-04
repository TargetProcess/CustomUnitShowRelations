import * as $ from 'jquery';
import { IRelationConfig } from 'src/legend/legend.model';
import relationTypes from 'src/relationTypes';
import globalConfigurator from 'tau/configurator';
import * as globalBus from 'tau/core/global.bus';
import * as _ from 'underscore';

interface IRawRelation {
    ResourceType: string;
    Id: number;
    Master: {
        ResourceType: string;
        Id: number;
        Name: string;
    };
    Slave: {
        ResourceType: string;
        Id: number;
        Name: string;
    };
    RelationType: {
        ResourceType: string;
        Id: number;
        Name: string;
    };
}

export interface IRelation {
    index?: number;
    main: { id: number };
    entity: { id: number };
    relationType: { name: string };
}

interface IStore {
    id: number;
    unbind(context: object): void;
    on(event: object, callback: () => void, context: object): void;
}

const loadSimple = (url: string, params?: object) =>
    $.ajax({
        type: 'get',
        url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

const loadPages = (url: string, params?: object): JQuery.Promise<any> =>
    loadSimple(url, params)
        .then(({ Items, Next }) =>
            (Next ? (loadPages(Next).then((pageItems) => Items.concat(pageItems))) : Items));

const load = (resource: string, params?: object): JQuery.Promise<any> =>
    loadPages(`${globalConfigurator.getApplicationPath()}/api/v1/${resource}`, params);

const processItem = (item: IRawRelation): IRelation => ({
    relationType: {
        name: item.RelationType.Name
    },
    entity: {
        id: item.Slave.Id
    },
    main: {
        id: item.Master.Id
    }
});

let store: IStore | null = null;
const onStoreChanged = (_ as any).Callbacks();

globalBus.get().on('configurator.ready', (_e, configurator) => {
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
    public updated: any;

    private entityIds: number[] = [];
    private _relations: IRelation[] = [];
    private filterConfig!: string[];
    private store: IStore | null = null;

    constructor() {
        this.setFilterConfig([]);
        this.updated = (_ as any).Callbacks();
        onStoreChanged.add(() => this.subscribeForRelationsUpdate());
        this.subscribeForRelationsUpdate();
    }

    public load(entityIds: number[]): JQuery.Promise<IRelation[]> {
        if (_.intersection(entityIds, this.entityIds).length === entityIds.length) {
            return $.Deferred().resolve(this.getRelationsFiltered());
        }
        this.entityIds = entityIds;

        return this._getRelationsByIdsInternal(entityIds)
            .then((relations) => this._relations = relations)
            .then(() => this.getRelationsFiltered());
    }

    public refresh() {
        return this._getRelationsByIdsInternal(this._relations.map((r) => r.entity.id));
    }

    public setFilterConfig(config: IRelationConfig[]) {
        this.filterConfig = config.filter((c) => c.show)
            .map((relationType) => relationTypes.filter((r) => r.name === relationType.name)[0].name);
    }

    public getRelationsFiltered() {
        return this._relations.filter((r) => this.filterConfig.some((c) => c === r.relationType.name));
    }

    public _onRelationsChanged() {
        this._getRelationsByIdsInternal(this.entityIds).then((relations) => {
            this._relations = relations;
            this.updated.fire();
        });
    }

    public subscribeForRelationsUpdate() {
        if (this.store) {
            this.store.unbind(this);
        }
        this.store = store!;
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

    public _getRelationsByIdsInternal(entityIds: number[]): JQuery.Promise<IRelation[]> {
        if (!entityIds.length) {
            return $.Deferred().resolve();
        }

        return load('relations', {
            where: `Master.Id in (${entityIds.join(',')})`,
            include: '[Slave[Id],Master[Id],RelationType[Name]]'
        }).then((items: IRawRelation[]) =>
            items.map((v) => processItem(v))
        ).fail(() => {
            return [];
        });
    }
}
