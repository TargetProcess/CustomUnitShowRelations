import _ from 'underscore';
import viewModes from '../const.view.modes';
import React from 'react';
import relationTypes from '../relationTypes';
import RestStorage from 'tau/storage/api.nocache';
import actionsIntegration from 'tau/api/actions/v1';
import tausTrack from '../relations.taus';
import ComponentLegendWrapper from './component.legend.wrapper.jsx';

const REST_STORAGE_GROUP_NAME = 'showRelations';
const FIELD_NAME = 'userData';

const defaultConfig = relationTypes.map((r) => ({...r, show: true}));
const onUpdateLegend = _.Callbacks();

actionsIntegration.addControl(<ComponentLegendWrapper onUpdateLegend={onUpdateLegend}/>);

export default class LegendModel {
    constructor(relationsDrawer, dataFetcher, boardSettings) {
        this.boardSettings = boardSettings;
        this.restStorage = new RestStorage();
        this.relationsDrawer = relationsDrawer;
        this.dataFetcher = dataFetcher;
        this.saveToStorage = _.throttle(this._saveToStorage, 1000, {leading: false});

        this.initializeSubscriptions();
        this.setInitialData(boardSettings);

        this.loadSettings().then(() => this.refresh());
    }

    initializeSubscriptions() {
        actionsIntegration.onShow(() => {
            this.refresh();
        });
    }

    setInitialData(boardSettings) {
        this._userKey = `user${(window.loggedUser || {id: null}).id}-${boardSettings.settings.id}`;
        this.isShown = false;
        this.relations = _.deepClone(defaultConfig);
        this.dataFetcher.setFilterConfig(this.relations);
    }

    data() {
        return {
            isVisible: this.boardSettings.settings.viewMode !== viewModes.DETAILS,
            onUpdateLegend: onUpdateLegend,
            isExpanded: this.isShown,
            relations: this.relations,
            metadata: this.metadata,
            onExpansionStateChange: this.changeShowState,
            onRelationTypeSelect: this.changeRelationTypes
        };
    }

    changeRelationTypes = ({name = '', show = false}) => {
        tausTrack({
            name: `${show ? 'add' : 'remove'}-${name.toLowerCase()}`
        });
        this.relations.filter(({name: relationName}) => relationName === name)[0].show = show;
        this.dataFetcher.setFilterConfig(this.relations);
        this.saveToStorage();
        this.refresh();
    };

    changeShowState = (isShown) => {
        tausTrack({
            name: isShown ? 'show' : 'hide'
        });
        this.isShown = isShown;
        this.saveToStorage();
        this.refresh();
    };

    _saveToStorage() {
        this.restStorage.data(REST_STORAGE_GROUP_NAME, this._userKey, {
            relations: JSON.stringify({
                expanded: this.isShown,
                metadata: this.metadata,
                relations: this.relations.map((r) => {
                    return {name: r.name, show: r.show};
                })
            })
        });
    }

    loadSettings() {
        return this.restStorage
            .select(REST_STORAGE_GROUP_NAME, {
                $where: {key: this._userKey},
                $fields: [FIELD_NAME]
            }).then((response) => {
                const data = response.data && response.data[0] && response.data[0].userData;

                if (data) {
                    const relationsConfig = JSON.parse(data.relations);

                    if (!_.isUndefined(relationsConfig.expanded)) {
                        this.isShown = relationsConfig.expanded;
                    }

                    if (relationsConfig.relations) {
                        this.relations = this.relations.map((r) => {
                            const matchedRelationConfig = relationsConfig.relations.filter(c => c.name === r.name)[0];

                            if (matchedRelationConfig) {
                                r.show = matchedRelationConfig.show;
                            }
                            return r;
                        });
                    }
                    this.dataFetcher.setFilterConfig(this.relations);
                }
            });
    }

    refresh() {
        if (this.isShown === false) {
            this.relationsDrawer.removeAll();
        } else {
            this.relationsDrawer.redraw();
        }
        onUpdateLegend.fire(this.data());
    }

    destroy() {
        actionsIntegration.unbind();
        delete this.relationsDrawer;
    }
}
