import $ from 'jquery';

let selectedCardIds = [];

const hideSelection = ($card) => {
    if ($card.hasClass('tau-selected')) {
        $card.removeClass('tau-selected');
        selectedCardIds = selectedCardIds.concat($card.data('id'));
    }
};

const highlightCard = (card, directionType, viewMode) => {
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

const cleanCards = ($grid) => {
    ['related', 'related-inbound', 'related-outbound', 'source'].forEach((v) => {
        const className = `mashupCustomUnitShowRelations__${v}`;

        $grid.find(`.${className}`).removeClass(className);
    });
};

export const cleanGridAndCards = ($grid) => {
    if ($grid) {
        $grid.removeClass('mashupCustomUnitShowRelations');
        $grid.removeClass('mashupCustomUnitShowRelations-highlighted');

        cleanCards($grid);
    }
};

export const getHighlightCardsByRelations = ($grid, cardsByEntityId, viewMode) => {
    const getCardsByEntityId = (entityId) => cardsByEntityId[entityId] || [];

    const highlightCardsByRelation = (relation) => {
        getCardsByEntityId(relation.entity.id).forEach((card) => {
            highlightCard(card, relation.directionType, viewMode);
        });
    };

    $grid.addClass('mashupCustomUnitShowRelations');
    cleanCards($grid);

    return (relations, sourceCard) => {
        const $card = $(sourceCard);

        $card.addClass('mashupCustomUnitShowRelations__source');
        hideSelection($card);

        relations.forEach(highlightCardsByRelation);
    };
};
