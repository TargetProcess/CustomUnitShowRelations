import * as React from 'react';
import ViewMode from 'src/const.view.modes';
import RelationsData from 'src/data';
import { IBoardSettings } from 'src/index';
import ComponentLegendWrapper from 'src/legend/component.legend.wrapper';
import RelationDraw from 'src/relations.draw';
import tausTrack from 'src/relations.taus';
import relationTypes, { IRelationType } from 'src/relationTypes';
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
    public isShown = false;

    private boardSettings: IBoardSettings;
    private restStorage: RestStorage;
    private relationsDrawer: RelationDraw;
    private dataFetcher: RelationsData;
    private saveToStorage: () => void;

    private _userKey!: string;
    private relationConfigs!: IRelationConfig[];

    constructor(relationsDrawer: RelationDraw, dataFetcher: RelationsData, boardSettings: IBoardSettings) {
        this.boardSettings = boardSettings;
        this.restStorage = new RestStorage();
        this.relationsDrawer = relationsDrawer;
        this.dataFetcher = dataFetcher;
        this.saveToStorage = _.throttle(this._saveToStorage, 1000, { leading: false });

        this.initializeSubscriptions();
        this.setInitialData(boardSettings);

        this.loadSettings().then(() => this.refresh());
    }

    public initializeSubscriptions() {
        actionsIntegration.onShow(() => {
            this.refresh();
        });
    }

    public setInitialData(boardSettings: IBoardSettings) {
        const currentUserId = window.loggedUser ? window.loggedUser.id : null;
        this._userKey = `user${currentUserId}-${boardSettings.settings.id}`;
        this.isShown = false;
        this.relationConfigs = relationTypes.map((r) => ({ ...r, show: true }));
        this.dataFetcher.setFilterConfig(this.relationConfigs);
    }

    public data() {
        return {
            isVisible: this.boardSettings.settings.viewMode !== ViewMode.DETAILS,
            onUpdateLegend,
            isExpanded: this.isShown,
            relationConfigs: this.relationConfigs,
            onExpansionStateChange: this.changeShowState,
            onRelationTypeSelect: this.changeRelationTypes
        };
    }

    public changeRelationTypes = ({ name = '', show = false }) => {
        tausTrack({
            name: `${show ? 'add' : 'remove'}-${name.toLowerCase()}`
        });
        this.relationConfigs.filter(({ name: relationName }) => relationName === name)[0].show = show;
        this.dataFetcher.setFilterConfig(this.relationConfigs);
        this.saveToStorage();
        this.refresh();
    }

    public changeShowState = (isShown: boolean) => {
        tausTrack({
            name: isShown ? 'show' : 'hide'
        });
        this.isShown = isShown;
        this.saveToStorage();
        this.refresh();
    }

    public _saveToStorage() {
        this.restStorage.data(REST_STORAGE_GROUP_NAME, this._userKey, {
            relations: JSON.stringify({
                expanded: this.isShown,
                relations: this.relationConfigs.map((r) => ({ name: r.name, show: r.show }))
            })
        });
    }

    public loadSettings() {
        return this.restStorage
            .select(REST_STORAGE_GROUP_NAME, {
                $where: { key: this._userKey },
                $fields: [FIELD_NAME]
            }).then((response) => {
                const data = response.data && response.data[0] && response.data[0].userData;

                if (data) {
                    const relationsConfig = JSON.parse(data.relations);

                    if (!_.isUndefined(relationsConfig.expanded)) {
                        this.isShown = relationsConfig.expanded;
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
                    this.dataFetcher.setFilterConfig(this.relationConfigs);
                }
            });
    }

    public refresh() {
        if (this.relationsDrawer) {
            if (!this.isShown) {
                this.relationsDrawer.removeAll();
            } else {
                this.relationsDrawer.redraw();
            }
            onUpdateLegend.fire(this.data());
        }
    }

    public cleanup() {
        actionsIntegration.unbind();
        delete this.relationsDrawer;
    }
}
