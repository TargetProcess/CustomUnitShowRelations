import * as $ from 'jquery';

import ViewMode from 'src/const.view.modes';
import { IRelation } from 'src/data';
import { ICardsGroupedByEntityId } from 'src/relations.draw';

let selectedCardIds: number[] = [];

const hideSelection = ($card: JQuery) => {
    if ($card.hasClass('tau-selected')) {
        $card.removeClass('tau-selected');
        selectedCardIds = selectedCardIds.concat($card.data('id'));
    }
};

const highlightCard = (card: HTMLElement, viewMode: ViewMode) => {
    const $el = $(card);

    if (viewMode === 'timeline') {
        const $parent = $el.parent('.i-role-timeline-card-holder');

        if ($parent.length) {
            $parent.addClass('mashupCustomUnitShowRelations__related');
            hideSelection($parent);
        }
    }

    hideSelection($el);
    $el.addClass('mashupCustomUnitShowRelations__related');
};

const cleanCards = ($grid: JQuery) => {
    ['related', 'related-inbound', 'related-outbound', 'source'].forEach((v) => {
        const className = `mashupCustomUnitShowRelations__${v}`;

        $grid.find(`.${className}`).removeClass(className);
    });
};

export const cleanGridAndCards = ($grid: JQuery) => {
    if ($grid) {
        $grid.removeClass('mashupCustomUnitShowRelations');
        $grid.removeClass('mashupCustomUnitShowRelations-highlighted');

        cleanCards($grid);
    }
};

export function buildCardsByRelationsHighlighter($grid: JQuery, cardsByEntityId: ICardsGroupedByEntityId, viewMode: ViewMode) {
    const getCardsByEntityId = (entityId: number) => cardsByEntityId[entityId] || [];

    const highlightCardsByRelation = (relation: IRelation) => {
        getCardsByEntityId(relation.entity.id).forEach((card) => {
            highlightCard(card, viewMode);
        });
    };

    $grid.addClass('mashupCustomUnitShowRelations');
    cleanCards($grid);

    return (relations: IRelation[], sourceCard: HTMLElement) => {
        const $card = $(sourceCard);

        $card.addClass('mashupCustomUnitShowRelations__source');
        hideSelection($card);

        relations.forEach(highlightCardsByRelation);
    };
}
