import * as React from 'react';
import Application from 'src/application';
import ComponentLegendWrapper from 'src/legend/component.legend.wrapper';
import relationTypes, { IRelationType } from 'src/relation_types';
import tausTrack from 'src/utils/taus';
import ViewMode from 'src/view_mode';
import actionsIntegration from 'tau/api/actions/v1';
import RestStorage from 'tau/storage/api.nocache';
import * as _ from 'underscore';

const REST_STORAGE_GROUP_NAME = 'showRelations';
const FIELD_NAME = 'userData';

const onUpdateLegend = (_ as any).Callbacks();

export interface IRelationConfig extends IRelationType {
    show: boolean;
}

actionsIntegration.addControl(<ComponentLegendWrapper onUpdateLegend={onUpdateLegend} />);

export default class LegendModel {
    private application: Application;
    private restStorage: RestStorage;
    private saveToStorage: () => void;

    private _userKey!: string;
    private relationConfigs!: IRelationConfig[];

    constructor(application: Application) {
        this.application = application;
        this.restStorage = new RestStorage();
        this.saveToStorage = _.throttle(this._saveToStorage, 1000, { leading: false });

        this.initializeSubscriptions();
        this.setInitialData();

        this.loadSettings().then(() => this.refresh());
    }

    public cleanup() {
        actionsIntegration.unbind();
    }

    private initializeSubscriptions() {
        actionsIntegration.onShow(() => {
            this.refresh();
        });
    }

    private setInitialData() {
        const currentUserId = window.loggedUser ? window.loggedUser.id : null;
        this._userKey = `user${currentUserId}-${this.application.boardId}`;
        this.application.setIsActive(false);
        this.relationConfigs = relationTypes.map((r) => ({ ...r, show: true }));
        this.application.dataFetcher.setFilterConfig(this.relationConfigs);
    }

    private data() {
        return {
            isVisible: this.application.viewMode !== ViewMode.DETAILS,
            onUpdateLegend,
            isExpanded: this.application.isActive,
            relationConfigs: this.relationConfigs,
            onExpansionStateChange: this.changeShowState,
            onRelationTypeSelect: this.changeRelationTypes
        };
    }

    private changeRelationTypes = ({ name = '', show = false }) => {
        tausTrack({
            name: `${show ? 'add' : 'remove'}-${name.toLowerCase()}`
        });
        this.relationConfigs.filter(({ name: relationName }) => relationName === name)[0].show = show;
        this.application.dataFetcher.setFilterConfig(this.relationConfigs);
        this.saveToStorage();
        this.refresh();
    }

    private changeShowState = (isShown: boolean) => {
        tausTrack({
            name: isShown ? 'show' : 'hide'
        });
        this.application.setIsActive(isShown);
        this.saveToStorage();
        this.refresh();
    }

    private _saveToStorage() {
        this.restStorage.data(REST_STORAGE_GROUP_NAME, this._userKey, {
            relations: JSON.stringify({
                expanded: this.application.isActive,
                relations: this.relationConfigs.map((r) => ({ name: r.name, show: r.show }))
            })
        });
    }

    private loadSettings() {
        return this.restStorage
            .select(REST_STORAGE_GROUP_NAME, {
                $where: { key: this._userKey },
                $fields: [FIELD_NAME]
            }).then((response) => {
                const data = response.data && response.data[0] && response.data[0].userData;

                if (data) {
                    const relationsConfig = JSON.parse(data.relations);

                    if (!_.isUndefined(relationsConfig.expanded)) {
                        this.application.setIsActive(relationsConfig.expanded);
                    }

                    if (relationsConfig.relations) {
                        this.relationConfigs = this.relationConfigs.map((r) => {
                            const [matchedRelationConfig] = relationsConfig.relations.filter((c: any) => c.name === r.name);

                            if (matchedRelationConfig) {
                                r.show = matchedRelationConfig.show;
                            }
                            return r;
                        });
                    }
                    this.application.dataFetcher.setFilterConfig(this.relationConfigs);
                }
            });
    }

    private refresh() {
        if (!this.application.isActive) {
            this.application.renderer.removeAll();
        } else {
            this.application.renderer.redraw();
        }
        onUpdateLegend.fire(this.data());
    }
}
