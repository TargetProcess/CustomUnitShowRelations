import Application, { IApplicationState } from 'src/application';
import { relationsConfigs, RelationType } from 'src/relations';
import { isBoardConfigChanged } from 'src/utils/state';
import RestStorage from 'tau/storage/api.nocache';
import * as _ from 'underscore';

interface IStorageData {
    expanded: boolean;
    relations: Array<{ name: RelationType, show: boolean }>;
}

const REST_STORAGE_GROUP_NAME = 'showRelations';

export default class Settings {
    private application: Application;
    private restStorage = new RestStorage();
    private persistApplicationSettingsThrottled = _.throttle(this.persistApplicationSettings.bind(this), 1000, { leading: false });

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.loadBoardSettingsOnBoardChangedReducer.bind(this));
        this.application.registerReducer(this.saveSettingsOnChangeReducer.bind(this));
    }

    private async persistApplicationSettings() {
        const { isUiActive, visibleRelationTypes } = this.application.getState();

        this.restStorage.data(REST_STORAGE_GROUP_NAME, this.buildUserKey(), {
            relations: JSON.stringify({
                expanded: isUiActive,
                relations: relationsConfigs.map((relationConfig) => ({
                    name: relationConfig.type,
                    show: visibleRelationTypes.has(relationConfig.type)
                }))
            })
        });
    }

    private async loadApplicationSettings() {
        const response = await this.restStorage.select(REST_STORAGE_GROUP_NAME, {
            $where: { key: this.buildUserKey() },
            $fields: ['userData']
        });
        const data = response.data && response.data[0] && response.data[0].userData;
        if (!data) {
            return {};
        }

        const loadedConfig: IStorageData = JSON.parse(data.relations);
        const stateChanges: Partial<IApplicationState> = {};

        if (!_.isUndefined(loadedConfig.expanded)) {
            stateChanges.isUiActive = loadedConfig.expanded;
        }

        if (loadedConfig.relations) {
            const visibleRelationTypes = loadedConfig.relations.reduce((acc, relationConfig) => {
                if (relationConfig.show) {
                    acc.add(relationConfig.name);
                }

                return acc;
            }, new Set<RelationType>());
            stateChanges.visibleRelationTypes = visibleRelationTypes;
        } else {
            stateChanges.visibleRelationTypes = new Set(relationsConfigs.map((relationConfig) => relationConfig.type));
        }

        return stateChanges;
    }

    private buildUserKey() {
        const currentUserId = window.loggedUser ? window.loggedUser.id : null;
        return `user${currentUserId}-${this.application.getState().boardId}`;
    }

    private async loadBoardSettingsOnBoardChangedReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.application.getState().isOnAppropriatePage) {
            return {};
        }

        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        return this.loadApplicationSettings();
    }

    private async saveSettingsOnChangeReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (_.isUndefined(changes.isUiActive) && !changes.visibleRelationTypes) {
            return {};
        }

        this.persistApplicationSettingsThrottled(this);
        return {};
    }
}
