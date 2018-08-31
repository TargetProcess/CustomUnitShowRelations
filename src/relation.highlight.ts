import * as $ from 'jquery';

import ViewMode from 'src/const.view.modes';
import { IRelation } from 'src/data';
import DirectionType from 'src/relationDirections';
import { ICardsGroupedByEntityId } from 'src/relations.draw';

let selectedCardIds: number[] = [];

const hideSelection = ($card: JQuery) => {
    if ($card.hasClass('tau-selected')) {
        $card.removeClass('tau-selected');
        selectedCardIds = selectedCardIds.concat($card.data('id'));
    }
};

const highlightCard = (card: HTMLElement, directionType: DirectionType, viewMode: ViewMode) => {
    const $el = $(card);

    if (viewMode === 'timeline') {
        const $parent = $el.parent('.i-role-timeline-card-holder');

        if ($parent.length) {
            $parent.addClass('mashupCustomUnitShowRelations__related');
            $parent.addClass(`mashupCustomUnitShowRelations__${directionType}`);
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

export function getHighlightCardsByRelations($grid: JQuery, cardsByEntityId: ICardsGroupedByEntityId, viewMode: ViewMode) {
    const getCardsByEntityId = (entityId: string) => cardsByEntityId[entityId] || [];

    const highlightCardsByRelation = (relation: IRelation) => {
        getCardsByEntityId(relation.entity.id).forEach((card) => {
            highlightCard(card, relation.directionType, viewMode);
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
