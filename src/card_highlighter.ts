import * as $ from 'jquery';

import { IRelation } from 'src/data';
import { ICardsGroupedByEntityId } from 'src/rendering/renderer';
import ViewMode from 'src/view_mode';

const hideSelection = ($card: JQuery) => {
    $card.removeClass('tau-selected');
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
    ['related', 'source'].forEach((postfix) => {
        const className = `mashupCustomUnitShowRelations__${postfix}`;

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

export function buildCardsHighlighter($grid: JQuery, cardsByEntityId: ICardsGroupedByEntityId, viewMode: ViewMode) {
    const getCardsByEntityId = (entityId: number) => cardsByEntityId[entityId] || [];

    const highlightCardsByRelation = (relation: IRelation) => {
        getCardsByEntityId(relation.slave.id).forEach((card) => {
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
