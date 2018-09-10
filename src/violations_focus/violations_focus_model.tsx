import * as React from 'react';
import * as ReactDom from 'react-dom';
import Application from 'src/application';
import { IArrow } from 'src/rendering/renderer';
import ViewMode from 'src/view_mode';
import ViolationsButton from 'src/violations_focus/ui/ViolationsButton';

const WRAPPER_CLASS = 'tau-board-header__control--relations';

export default class ViolationFocusModel {
    private application: Application;
    private $buttonWrapper: JQuery | null = null;
    private arrows: IArrow[] = [];

    public constructor(application: Application) {
        this.application = application;
    }

    public renderButton() {
        if (this.application.viewMode !== ViewMode.BOARD || !this.application.isActive) {
            this.cleanup();
            return;
        }

        const $wrapper = this.tryCreateWrapper($('.tau-board'));
        if (!$wrapper) {
            return;
        }
        this.$buttonWrapper = $wrapper;

        const arrowsWithViolations = this.arrows.filter((arrow) => {
            const mainElement = arrow.getMainElement();
            const slaveElement = arrow.getSlaveElement();
            if (!mainElement || !slaveElement) {
                return false;
            }

            return this.application.validationStrategy.isRelationViolated(mainElement, slaveElement);
        });
        if (arrowsWithViolations.length === 0) {
            $wrapper.hide();
            return;
        }
        $wrapper.show();

        const relationsAreFocused = this.application.interactionModel.hasRelationInFocus();
        const violatedRelations = arrowsWithViolations.map((arrow) => [arrow.mainEntityId, arrow.slaveEntityId]) as Array<[number, number]>;
        const onClick = relationsAreFocused ?
            () => this.application.interactionModel.clearFocusedRelations() :
            () => this.application.interactionModel.focusOnRelations(violatedRelations);

        ReactDom.render(
            <ViolationsButton
                violationsCount={arrowsWithViolations.length}
                isActive={relationsAreFocused}
                onClick={onClick}
            />,
            this.$buttonWrapper.get(0)
        );
    }

    public updateUi() {
        this.renderButton();
    }

    public setArrows(newArrows: IArrow[]) {
        this.arrows = newArrows;
        this.renderButton();
    }

    public cleanup() {
        if (this.$buttonWrapper) {
            this.$buttonWrapper.remove();
            this.$buttonWrapper = null;
        }
        this.arrows = [];
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
}
