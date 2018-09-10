import * as $ from 'jquery';
import Application from 'src/application';
import { IArrow, ICardsGroupedByEntityId } from 'src/rendering/renderer';
import tausTrack from 'src/utils/taus';
import ViewMode from 'src/view_mode';

const highlightedMode = 'mashupCustomUnitShowRelations__highlighted';
const highlightedElement = 'mashupCustomUnitShowRelations-highlighted mashupCustomUnitShowRelations__svg-highlighted';

export default class InteractionModel {
    private application: Application;
    private arrows: IArrow[] = [];
    private cardsByEntityId: ICardsGroupedByEntityId = {};
    private viewMode: ViewMode | null = null;

    private focusedArrowIds = new Set<string>();
    private focusedCardsIds = new Set<string>();
    private selectedArrowIds = new Set<string>();
    private selectedCardsIds = new Set<string>();
    private highlightedCardIds = new Set<string>();

    public constructor(application: Application) {
        this.application = application;
    }

    public updateInteractionsData(cardsByEntityId: ICardsGroupedByEntityId, arrows: IArrow[], viewMode: ViewMode) {
        this.cardsByEntityId = cardsByEntityId;
        this.arrows = arrows;
        this.viewMode = viewMode;

        this.clearFocusedRelations();

        this.getGrid().off('mousedown.highlights');
        this.getGrid().on('mousedown.highlights', ({ target }) => {
            if ($(target).parents().hasClass('i-role-card')) {
                return;
            }

            tausTrack({
                name: 'reset-highlights'
            });
            this.clearHighLights();
            this.disableUi();
        });
    }

    public bindArrowHighlightInteractions($lines: JQuery<SVGPathElement>, mainEntityId: number, slaveEntityId: number, relationType: string) {
        $lines.on('mouseenter', () => this.highlightRelation(mainEntityId, slaveEntityId));
        $lines.on('mouseleave', () => this.unhighlightRelation(mainEntityId, slaveEntityId));
        $lines.on('mousedown', this.getClickHandler(mainEntityId, slaveEntityId, relationType));
    }

    public redrawInteractionsHighlights() {
        const focusedArrowIdsClone = [...this.focusedArrowIds];
        const focusedCardsIdsClone = [...this.focusedCardsIds];
        const selectedArrowIdsClone = [...this.selectedArrowIds];
        const selectedCardIdsClone = [...this.selectedCardsIds];
        const highlightedCardIdsClone = [...this.highlightedCardIds];

        this.clearHighLights();

        focusedArrowIdsClone.forEach((arrowId) => this.focusArrow(arrowId));
        focusedCardsIdsClone.forEach((cardId) => this.focusCard(cardId));
        selectedArrowIdsClone.forEach((arrowId) => this.selectArrow(arrowId));
        selectedCardIdsClone.forEach((cardId) => this.selectCard(cardId));
        highlightedCardIdsClone.forEach((cardId) => this.highlightCard(cardId));
    }

    public hasRelationInFocus() {
        return this.focusedArrowIds.size !== 0;
    }

    public focusOnRelations(relations: Array<[number, number]>) {
        this.clearHighLights();
        relations.forEach(([mainElementId, slaveElementId]) => {
            const arrowId = this.getArrowId(mainElementId, slaveElementId);
            this.focusArrow(arrowId);
            this.focusCard(String(mainElementId));
            this.focusCard(String(slaveElementId));
        });

        this.toggleUi();
        this.application.violationFocusModel.updateUi();
    }

    public clearFocusedRelations() {
        [...this.focusedArrowIds].forEach((arrowId) => this.unfocusArrow(arrowId));
        [...this.focusedCardsIds].forEach((cardId) => this.unfocusCard(cardId));

        this.toggleUi();
        this.application.violationFocusModel.updateUi();
    }

    public unbindAndResetHighlights() {
        this.clearHighLights();
        this.getGrid().off('mousedown.highlights');
    }

    private clearHighLights() {
        this.clearFocusedRelations();
        [...this.selectedArrowIds].forEach((arrowId) => this.unselectArrow(arrowId));
        [...this.selectedCardsIds].forEach((cardId) => this.unselectCard(cardId));
        [...this.highlightedCardIds].forEach((cardId) => this.unhighlightCard(cardId));
    }

    private highlightRelation(mainEntityId: number, slaveEntityId: number, isSelection = false) {
        if (isSelection) {
            this.selectArrow(this.getArrowId(mainEntityId, slaveEntityId));
            [String(mainEntityId), String(slaveEntityId)].forEach((cardId) => this.selectCard(cardId));
        } else {
            [String(mainEntityId), String(slaveEntityId)].forEach((cardId) => this.highlightCard(cardId));
        }

        this.toggleUi();
    }

    private unhighlightRelation(mainEntityId: number, slaveEntityId: number, isUnselection = false) {
        if (isUnselection) {
            this.unselectArrow(this.getArrowId(mainEntityId, slaveEntityId));
            [String(mainEntityId), String(slaveEntityId)].forEach((cardId) => this.unselectCard(cardId));
        } else {
            [String(mainEntityId), String(slaveEntityId)].forEach((cardId) => this.unhighlightCard(cardId));
        }

        this.toggleUi();
    }

    private getClickHandler(mainEntityId: number, slaveEntityId: number, relationType: string) {
        return () => {
            this.clearFocusedRelations();
            const arrowId = this.getArrowId(mainEntityId, slaveEntityId);
            const isCurrentlySelected = this.selectedArrowIds.has(arrowId);

            isCurrentlySelected ? this.unhighlightRelation(mainEntityId, slaveEntityId, true) : this.highlightRelation(mainEntityId, slaveEntityId, true);

            tausTrack({
                name: isCurrentlySelected ? 'unfix-arrow' : 'fix-arrow',
                mainEntityId,
                slaveEntityId,
                relationType
            });

            return false;
        };
    }

    private focusArrow(arrowId: string) {
        if (!this.focusedArrowIds.has(arrowId)) {
            this.getArrowsLinesById(arrowId).forEach(this.focusArrowLines);
        }

        this.focusedArrowIds.add(arrowId);
    }

    private unfocusArrow(arrowId: string) {
        if (this.focusedArrowIds.has(arrowId)) {
            this.getArrowsLinesById(arrowId).forEach(this.unfocusArrowLines);
        }

        this.focusedArrowIds.delete(arrowId);
    }

    private selectArrow(arrowId: string) {
        if (!this.selectedArrowIds.has(arrowId)) {
            this.getArrowsLinesById(arrowId).forEach(this.selectArrowLines);
        }

        this.selectedArrowIds.add(arrowId);
    }

    private unselectArrow(arrowId: string) {
        if (this.selectedArrowIds.has(arrowId)) {
            this.getArrowsLinesById(arrowId).forEach(this.unselectArrowLines);
        }

        this.selectedArrowIds.delete(arrowId);
    }

    private focusCard(cardId: string) {
        this.focusedCardsIds.add(cardId);
        this.highlightCard(cardId);
    }

    private unfocusCard(cardId: string) {
        if (!this.focusedCardsIds.has(cardId)) {
            return;
        }

        this.focusedCardsIds.delete(cardId);
        this.unhighlightCard(cardId);
    }

    private selectCard(cardId: string) {
        this.selectedCardsIds.add(cardId);
        this.highlightCard(cardId);
    }

    private unselectCard(cardId: string) {
        if (!this.selectedCardsIds.has(cardId)) {
            return;
        }

        this.selectedCardsIds.delete(cardId);
        this.unhighlightCard(cardId);
    }

    private highlightCard(cardId: string) {
        if (!this.highlightedCardIds.has(cardId)) {
            this.cardsByEntityId[cardId]!.forEach((card) => this.highlightCardElement(card));
        }

        this.highlightedCardIds.add(cardId);
    }

    private unhighlightCard(cardId: string) {
        if (this.selectedCardsIds.has(cardId) || this.focusedCardsIds.has(cardId)) {
            return;
        }

        if (this.highlightedCardIds.has(cardId)) {
            this.cardsByEntityId[cardId]!.forEach((card) => this.unHighlightCardElement(card));
        }

        this.highlightedCardIds.delete(cardId);
    }

    private highlightCardElement(card: HTMLElement) {
        const cardElement = $(card);

        if (!cardElement.length) {
            return;
        }

        cardElement.addClass(highlightedMode);

        if (this.viewMode === ViewMode.TIMELINE) {
            cardElement.parent('.i-role-timeline-card-holder').addClass(highlightedMode);
        }
    }

    private unHighlightCardElement(card: HTMLElement) {
        const cardElement = $(card);

        cardElement.removeClass(highlightedMode);

        if (this.viewMode === ViewMode.TIMELINE) {
            cardElement.parent('.i-role-timeline-card-holder').removeClass(highlightedMode);
        }
    }

    private getGrid() {
        return $('.i-role-grid');
    }

    private toggleUi() {
        const somethingIsHighlighted = this.highlightedCardIds.size !== 0 || this.selectedArrowIds.size !== 0 || this.focusedArrowIds.size !== 0;
        somethingIsHighlighted ? this.enableUi() : this.disableUi();
    }

    private enableUi() {
        this.getGrid().addClass(highlightedElement);
    }

    private disableUi() {
        this.getGrid().removeClass(highlightedElement);
    }

    private focusArrowLines($lines: JQuery<SVGPathElement>) {
        $($lines).filter('.line').attr('class', 'line line__highlighted line__focused');
    }

    private unfocusArrowLines($lines: JQuery<SVGPathElement>) {
        $($lines).filter('.line').attr('class', 'line');
    }

    private selectArrowLines($lines: JQuery<SVGPathElement>) {
        $($lines).filter('.line').attr('class', 'line line__highlighted');
    }

    private unselectArrowLines($lines: JQuery<SVGPathElement>) {
        $($lines).filter('.line').attr('class', 'line');
    }

    private getArrowId(mainEntityId: number, slave: number) {
        return `${mainEntityId}-${slave}`;
    }

    private getArrowsLinesById(id: string) {
        return this.arrows.filter(({ arrowId }) => arrowId === id).map(({ $lines }) => $lines);
    }
}
