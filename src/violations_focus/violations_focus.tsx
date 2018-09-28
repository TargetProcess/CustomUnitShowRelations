import * as Combokeys from 'combokeys';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Application, { IApplicationState } from 'src/application';
import { ViewMode } from 'src/board';
import { addClassToSvgElement, removeClassFromSvgElement } from 'src/utils/dom';
import ViolationsButton from 'src/violations_focus/ui/violations_button';
import configurator from 'tau/configurator';
import * as _ from 'underscore';

import 'styles/violation_button.scss';

const WRAPPER_CLASS = 'tau-board-header__control--relations';
const SVG_FOCUS_ACTIVE_CLASS = 'focus-active';
const combokeys = new Combokeys(document.documentElement);

export default class ViolationFocus {
    public static register(application: Application) {
        const violationFocus = new ViolationFocus(application);
        application.registerReducer(violationFocus.updateUIReducer.bind(violationFocus));
        application.registerReducer(violationFocus.clearFocusReducer.bind(violationFocus));
        application.registerReducer(violationFocus.disableFocusOnAllViolatedLinesHiddenReducer.bind(violationFocus));
        application.registerReducer(violationFocus.updateSvgReducer.bind(violationFocus));

        return violationFocus;
    }

    private application: Application;
    private buttonWrapper: HTMLElement | null = null;

    public constructor(application: Application) {
        this.application = application;
        this.listenForBoardUiChanges();
        this.attachShortcutListener();
    }

    private updateUi() {
        const { viewMode, isFocusActive, isUiActive } = this.application.getState();

        if (viewMode !== ViewMode.Board || !isUiActive) {
            this.cleanup();
            return;
        }

        const $wrapper = this.tryCreateWrapper($('.tau-board'));
        if (!$wrapper) {
            return;
        }
        const newWrapper = $wrapper.get(0);
        if (!!this.buttonWrapper && this.buttonWrapper !== newWrapper) {
            this.cleanup();
        }
        this.buttonWrapper = newWrapper;

        const arrowsWithViolations = this.getVisibleArrowsWithViolations();
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
            this.buttonWrapper
        );
    }

    private cleanup() {
        if (this.buttonWrapper) {
            ReactDom.unmountComponentAtNode(this.buttonWrapper);
            this.buttonWrapper.remove();
            this.buttonWrapper = null;
        }
    }

    private getVisibleArrowsWithViolations() {
        const { arrows, visibleRelationTypes } = this.application.getState();
        return arrows.filter((arrow) => arrow.isViolated() && visibleRelationTypes.has(arrow.getRelation().relationType));
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

    private attachShortcutListener() {
        combokeys.bind('i', () => {
            const { viewMode, isFocusActive, isUiActive, isOnAppropriatePage } = this.application.getState();
            if (!isOnAppropriatePage || !isUiActive || viewMode !== ViewMode.Board) {
                return;
            }

            const arrowsWithViolations = this.getVisibleArrowsWithViolations();
            if (arrowsWithViolations.length === 0) {
                return;
            }

            this.application.setState({ isFocusActive: !isFocusActive });
        });
    }

    private listenForBoardUiChanges() {
        const registry = configurator.getBusRegistry();
        const listener = this.updateUi.bind(this);
        const targetBusName = 'board.toolbar';
        const targetEventName = 'afterRender';

        registry.on('create', (_e: any, { bus }: any) => {
            if (bus.name === targetBusName) {
                bus.on(targetEventName, listener);
            }
        });

        registry.on('destroy', (_e: any, { bus }: any) => {
            if (bus.name === targetBusName) {
                bus.removeListener(targetEventName, listener);
            }
        });

        registry.getByName(targetBusName).done((bus: any) => {
            bus.on(targetEventName, listener);
        });
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

        changes.isFocusActive ?
            addClassToSvgElement($svg.get(0), SVG_FOCUS_ACTIVE_CLASS) :
            removeClassFromSvgElement($svg.get(0), SVG_FOCUS_ACTIVE_CLASS);
        return {};
    }
}
