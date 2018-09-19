import * as React from 'react';
import LegendWrapper from 'src/action_menu/ui/legend_wrapper';
import Application, { IApplicationState } from 'src/application';
import { RelationType } from 'src/relations';
import tausTrack from 'src/utils/taus';
import ViewMode from 'src/view_mode';
import actionsIntegration from 'tau/api/actions/v1';
import * as _ from 'underscore';

const onPropsUpdated = (_ as any).Callbacks();
actionsIntegration.addControl(<LegendWrapper onPropsUpdated={onPropsUpdated} />);

export default class ActionMenu {
    private application: Application;

    constructor(application: Application) {
        this.application = application;
        actionsIntegration.onShow(() => this.updateUi());

        this.application.registerReducer(this.updateComponentOnUiChangesReducer.bind(this));
    }

    public updateUi() {
        onPropsUpdated.fire(this.getPropsForComponent());
    }

    private getPropsForComponent() {
        const { isUiActive, visibleRelationTypes } = this.application.getState();
        return {
            onPropsUpdated,
            isExpanded: isUiActive,
            isVisible: this.application.getState().viewMode !== ViewMode.Details,
            visibleRelationTypes,
            onExpansionStateChange: this.changeUiState,
            toggleRelationTypeVisibility: this.toggleRelationTypeVisibility
        };
    }

    private toggleRelationTypeVisibility = (relationType: RelationType) => {
        const visibleRelationTypes = this.application.getState().visibleRelationTypes;
        const isCurrentlyActive = visibleRelationTypes.has(relationType);
        tausTrack({
            name: `${isCurrentlyActive ? 'remove' : 'add'}-${relationType.toLowerCase()}`
        });

        const newVisibleRelationTypes = new Set(visibleRelationTypes);
        isCurrentlyActive ? newVisibleRelationTypes.delete(relationType) : newVisibleRelationTypes.add(relationType);
        this.application.setState({ visibleRelationTypes: newVisibleRelationTypes });
    }

    private changeUiState = (isActive: boolean) => {
        tausTrack({
            name: isActive ? 'show' : 'hide'
        });
        this.application.setState({ isUiActive: isActive });
    }

    private async updateComponentOnUiChangesReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (_.isUndefined(changes.isUiActive) && !changes.visibleRelationTypes) {
            return {};
        }

        this.updateUi();
        return {};
    }
}
