import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { Card } from 'src/cards';
import { addClassToSvgElement, removeClassFromSvgElement } from 'src/utils/dom';
import { getHighlightedArrows } from 'src/utils/state';
import * as _ from 'underscore';

const HIGHLIGHTED_GRID_CLASS = 'mashupCustomUnitShowRelations';
const HIGHLIGHTED_CARD_CLASS = 'mashupCustomUnitShowRelations__card_highlighted';

export default class CardHighlighter {
    public static register(application: Application) {
        const cardHighlighter = new CardHighlighter(application);
        application.registerReducer(cardHighlighter.updateHighlightingReducer.bind(cardHighlighter));

        return cardHighlighter;
    }

    private application: Application;

    public constructor(application: Application) {
        this.application = application;
    }

    private enableHighlighting() {
        this.application.getRenderingBackend().getGrid().addClass(HIGHLIGHTED_GRID_CLASS);
    }

    private disableHighlighting() {
        this.application.getRenderingBackend().getGrid().removeClass(HIGHLIGHTED_GRID_CLASS);
    }

    private highlightCard(card: Card) {
        addClassToSvgElement(card.getElement(), HIGHLIGHTED_CARD_CLASS);
    }

    private unhighlightExtraCards(cardsToHighlight: Card[]) {
        const highlightedCardElements = new Set(cardsToHighlight.map((card) => card.getElement()));
        $(`.${HIGHLIGHTED_CARD_CLASS}`).each((_index, cardElement) => {
            if (!highlightedCardElements.has(cardElement)) {
                removeClassFromSvgElement(cardElement, HIGHLIGHTED_CARD_CLASS);
            }
        });
    }

    private getCardsToHighlight() {
        return _.flatten(this.getActiveArrows().map((arrow) => [arrow.getMasterCard(), arrow.getSlaveCard()])) as Card[];
    }

    private getActiveArrows() {
        const { arrows, visibleRelationTypes } = this.application.getState();

        const highlightedArrows = getHighlightedArrows(this.application.getState());
        if (highlightedArrows.length !== 0) {
            return highlightedArrows;
        }

        return arrows.filter((arrow) => visibleRelationTypes.has(arrow.getRelation().relationType));
    }

    private async updateHighlightingReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.cards && !changes.arrows && !changes.visibleRelationTypes && _.isUndefined(changes.isUiActive) &&
            _.isUndefined(changes.isFocusActive) && !changes.selectedArrows && _.isUndefined(changes.hoveredArrow)) {
            return {};
        }

        const cardsToHighlight = this.getCardsToHighlight();
        this.unhighlightExtraCards(cardsToHighlight);

        if (!this.application.getState().isUiActive) {
            this.disableHighlighting();
            return {};
        }
        this.enableHighlighting();

        cardsToHighlight.forEach((card) => this.highlightCard(card));

        return {};
    }
}
