import Application, { IApplicationState } from 'src/application';
import { RelationType } from 'src/relations';
import { load } from 'src/utils/api';
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
        Name: RelationType;
    };
}

export interface IRelation {
    id: number;
    masterEntityId: number;
    slaveEntityId: number;
    relationType: RelationType;
}

interface IRelationAddedEvent {
    data: {
        id: number;
        changes: {
            master: {
                id: number;
            }
            slave: {
                id: number;
            }
        }
    };
}

interface IRelationRemovedEvent {
    data: {
        id: number;
        obj: {
            master: {
                id: number;
            }
            slave: {
                id: number;
            }
        }
    };
}

interface IStore {
    id: number;
    unbind(context: object): void;
    on(event: object, callback: (event: any) => void, context: object): void;
}

const processRawRelation = (item: IRawRelation): IRelation => ({
    id: item.Id,
    relationType: item.RelationType.Name,
    slaveEntityId: item.Slave.Id,
    masterEntityId: item.Master.Id
});

export default class RelationsFetcher {
    private application: Application;
    private relationsByMasterIdCache = new Map<number, IRelation[]>();
    private store: IStore | null = null;

    constructor(application: Application) {
        this.application = application;
        this.listenForStoreChanges();

        this.application.registerReducer(this.loadRelationsOnCardChangesReducer.bind(this));
    }

    private listenForStoreChanges() {
        globalBus.get().on('configurator.ready', (_e, configurator) => {
            const newStore = configurator.storeFactory.getStore();
            if (this.store === newStore) {
                return;
            }

            if (this.store) {
                this.store.unbind(this);
            }

            this.store = newStore;
            this.subscribeForRelationsUpdate();
        });
    }

    private subscribeForRelationsUpdate() {
        this.store!.on(
            {
                type: 'relation',
                eventName: 'afterSave',
                listener: this
            },
            (event: IRelationAddedEvent) => this.onRelationAdded(event),
            this
        );

        this.store!.on(
            {
                type: 'relation',
                eventName: 'afterRemove',
                listener: this
            },
            (event: IRelationRemovedEvent) => this.onRelationRemoved(event),
            this
        );
    }

    private async onRelationAdded(event: IRelationAddedEvent) {
        const [newRelation] = await this.loadAndCacheRelations([event.data.changes.master.id]);
        this.application.setState({ relations: [...this.application.getState().relations, newRelation] });
    }

    private onRelationRemoved(event: IRelationRemovedEvent) {
        const masterEntityId = event.data.obj.master.id;
        const cacheForRelation = this.relationsByMasterIdCache.get(masterEntityId) || [];
        const amendedCacheForRelations = cacheForRelation.filter((relation) => relation.id !== event.data.id);
        this.relationsByMasterIdCache.set(masterEntityId, amendedCacheForRelations);

        const { relations: visibleRelations } = this.application.getState();
        const amendedVisibleRelations = visibleRelations.filter((relation) => relation.id !== event.data.id);
        if (visibleRelations.length !== amendedVisibleRelations.length) {
            this.application.setState({ relations: amendedVisibleRelations });
        }
    }

    private load(entityIds: number[]) {
        const relationsFromCache: IRelation[] = [];
        const notCachedEntityIds: number[] = [];
        entityIds.forEach((entityId) => {
            if (this.relationsByMasterIdCache.has(entityId)) {
                relationsFromCache.push(...this.relationsByMasterIdCache.get(entityId)!);
            } else {
                notCachedEntityIds.push(entityId);
            }
        });

        if (notCachedEntityIds.length === 0) {
            return Promise.resolve(relationsFromCache);
        }

        return this.loadAndCacheRelations(notCachedEntityIds).then((newRelations) => {
            return _.uniq([...newRelations, ...relationsFromCache]);
        });
    }

    private async loadAndCacheRelations(entityIds: number[]) {
        if (entityIds.length === 0) {
            return Promise.resolve([]);
        }

        const rawRelations = await load<IRawRelation[]>('relations', {
            where: `Master.Id in (${entityIds.join(',')})`,
            include: '[Slave[Id],Master[Id],RelationType[Name]]'
        });
        const relations = rawRelations.map(processRawRelation);
        relations.forEach((relation) => {
            const cacheForRelation = this.relationsByMasterIdCache.get(relation.masterEntityId) || [];
            cacheForRelation.push(relation);
            this.relationsByMasterIdCache.set(relation.masterEntityId, _.uniq(cacheForRelation));
        });

        return relations;
    }

    private async loadRelationsOnCardChangesReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.cards) {
            return {};
        }

        if (changes.cards.length === 0) {
            return { relations: [] };
        }

        const newEntityIds = changes.cards.map((card) => card.getEntityId());
        const newRelations = await this.load(newEntityIds);
        return { relations: newRelations };
    }
}
