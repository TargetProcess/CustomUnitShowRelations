import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { Card } from 'src/cards';
import * as _ from 'underscore';

const HIGHLIGHTED_GRID_CLASS = 'mashupCustomUnitShowRelations';
const HIGHLIGHTED_CARD_CLASS = 'mashupCustomUnitShowRelations__card_highlighted';

export default class CardHighlighter {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.updateHighlightingReducer.bind(this));
    }

    private enableHighlighting() {
        this.application.getRenderingBackend().getGrid().addClass(HIGHLIGHTED_GRID_CLASS);
    }

    private disableHighlighting() {
        this.application.getRenderingBackend().getGrid().removeClass(HIGHLIGHTED_GRID_CLASS);
    }

    private highlightCard(card: Card) {
        card.getElement().classList.add(HIGHLIGHTED_CARD_CLASS);
    }

    private unhighlightAllCards() {
        $(`.${HIGHLIGHTED_CARD_CLASS}`).removeClass(HIGHLIGHTED_CARD_CLASS);
    }

    private getCardsToHighlight() {
        return _.flatten(this.getArrowsToHighlight().map((arrow) => [arrow.getMasterCard(), arrow.getSlaveCard()])) as Card[];
    }

    private getArrowsToHighlight() {
        const { isFocusActive, isUiActive, arrows, visibleRelationTypes, hoveredArrow, selectedArrows } = this.application.getState();

        if (!isUiActive) {
            return [];
        }

        if (isFocusActive) {
            const violatedArrows = arrows.filter((arrow) => arrow.isViolated() && visibleRelationTypes.has(arrow.getRelation().relationType));
            return hoveredArrow ? [hoveredArrow, ...violatedArrows] : violatedArrows;
        }

        if (selectedArrows.length !== 0) {
            return hoveredArrow ? [hoveredArrow, ...selectedArrows] : selectedArrows;
        }

        if (hoveredArrow) {
            return [hoveredArrow];
        }

        return arrows.filter((arrow) => visibleRelationTypes.has(arrow.getRelation().relationType));
    }

    private async updateHighlightingReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.cards && !changes.arrows && !changes.visibleRelationTypes && _.isUndefined(changes.isUiActive) &&
            _.isUndefined(changes.isFocusActive) && _.isUndefined(changes.hoveredArrow) && !changes.selectedArrows) {
            return {};
        }

        this.unhighlightAllCards();

        if (!this.application.getState().isUiActive) {
            this.disableHighlighting();
            return {};
        }
        this.enableHighlighting();

        const cardsToHighlight = this.getCardsToHighlight();
        if (cardsToHighlight.length === 0) {
            return {};
        }

        cardsToHighlight.forEach((card) => this.highlightCard(card));
        return {};
    }
}
