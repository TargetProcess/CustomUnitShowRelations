import * as React from 'react';
import * as ReactDom from 'react-dom';
import Application, { IApplicationState } from 'src/application';
import ViewMode from 'src/view_mode';
import ViolationsButton from 'src/violations_focus/ui/violations_button';
import * as _ from 'underscore';

import 'styles/violation_button.scss';

const WRAPPER_CLASS = 'tau-board-header__control--relations';
const SVG_FOCUS_ACTIVE_CLASS = 'focus-active';

export default class ViolationFocus {
    private application: Application;
    private $buttonWrapper: JQuery | null = null;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.updateUIReducer.bind(this));
        this.application.registerReducer(this.clearFocusReducer.bind(this));
        this.application.registerReducer(this.disableFocusOnAllViolatedLinesHiddenReducer.bind(this));
        this.application.registerReducer(this.updateSvgReducer.bind(this));
    }

    private updateUi() {
        const { viewMode, arrows, isFocusActive, visibleRelationTypes, isUiActive } = this.application.getState();

        if (viewMode !== ViewMode.Board || !isUiActive) {
            this.cleanup();
            return;
        }

        const $wrapper = this.tryCreateWrapper($('.tau-board'));
        if (!$wrapper) {
            return;
        }
        this.$buttonWrapper = $wrapper;

        const arrowsWithViolations = arrows.filter((arrow) => arrow.isViolated() && visibleRelationTypes.has(arrow.getRelation().relationType));
        if (arrowsWithViolations.length === 0) {
            $wrapper.hide();
            return;
        }
        $wrapper.show();

        const shouldEnableFocus = !isFocusActive;
        const onClick = () => {
            this.application.setState({ isFocusActive: shouldEnableFocus });
        };

        ReactDom.render(
            <ViolationsButton
                violationsCount={arrowsWithViolations.length}
                isActive={isFocusActive}
                onClick={onClick}
            />,
            this.$buttonWrapper.get(0)
        );
    }

    private cleanup() {
        if (this.$buttonWrapper) {
            this.$buttonWrapper.remove();
            this.$buttonWrapper = null;
        }
    }

    private tryCreateWrapper($boardHeader: JQuery) {
        const $existingWrapper = $boardHeader.find('.' + WRAPPER_CLASS);
        if ($existingWrapper.length !== 0) {
            return $existingWrapper;
        }

        const $neighbourElement = this.findNeighbourElement();
        if (!$neighbourElement) {
            return null;
        }

        const $newWrapper = $(`<div class=${WRAPPER_CLASS}></div>`);
        $neighbourElement.before($newWrapper);
        return $newWrapper;
    }

    private findNeighbourElement() {
        return [
            $('.tau-board-header__control--mashup'),
            $('.tau-board-header__control--actions')
        ].find(($element) => $element.length !== 0);
    }

    private async updateUIReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (_.isUndefined(changes.isFocusActive) && _.isUndefined(changes.isUiActive) && !changes.arrows && !changes.viewMode && !changes.visibleRelationTypes) {
            return {};
        }

        this.updateUi();
        return {};
    }

    private async clearFocusReducer(changes: Readonly<Partial<IApplicationState>>) {
        const uiWasToggledOff = !_.isUndefined(changes.isUiActive) && changes.isUiActive === false;
        const newArrowWasSelected = !!changes.selectedArrows && changes.selectedArrows.length !== 0;
        const shouldResetFocus = uiWasToggledOff || newArrowWasSelected;

        if (!shouldResetFocus) {
            return {};
        }

        return { isFocusActive: false };
    }

    private async disableFocusOnAllViolatedLinesHiddenReducer(changes: Readonly<Partial<IApplicationState>>) {
        const { isFocusActive, arrows, visibleRelationTypes } = this.application.getState();

        if (!isFocusActive) {
            return {};
        }

        if (!changes.visibleRelationTypes) {
            return {};
        }

        const arrowsWithViolations = arrows.filter((arrow) => arrow.isViolated() && visibleRelationTypes.has(arrow.getRelation().relationType));
        if (arrowsWithViolations.length === 0) {
            return { isFocusActive: false };
        }

        return {};
    }

    private async updateSvgReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (_.isUndefined(changes.isFocusActive)) {
            return {};
        }

        const $svg = this.application.getRenderingBackend().getSvg();
        if ($svg.length === 0) {
            return {};
        }

        changes.isFocusActive ? $svg.get(0).classList.add(SVG_FOCUS_ACTIVE_CLASS) : $svg.get(0).classList.remove(SVG_FOCUS_ACTIVE_CLASS);
        return {};
    }
}
