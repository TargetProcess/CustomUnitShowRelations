import $ from 'jquery';
import tausTrack from './relations.taus';

const highlightedMode = 'mashupCustomUnitShowRelations__highlighted';
const highlightedElement = 'mashupCustomUnitShowRelations-highlighted mashupCustomUnitShowRelations__svg-highlighted';

const highlightedArrowsArray = [];
const highlightedCardsArray = [];
let arrows = [];
let cardsByEntityId = [];
let viewMode;
let clickedArrows = {};

const getGrid = () => $('.i-role-grid');

const highlightSvgParent = () => getGrid().addClass(highlightedElement);
const unHighlightSvgParent = () => getGrid().removeClass(highlightedElement);

const highlightArrowLines = $lines => $($lines).filter('.line').attr('class', 'line line__highlighted');
const unHighlightArrowLines = $lines => $($lines).filter('.line').attr('class', 'line');

const getArrowsLinesByIds = id => arrows.filter(({arrowId}) => arrowId === id).map(({$lines}) => $lines);

const highlightArrows = (arrowsId) => {
    if (highlightedArrowsArray.indexOf(arrowsId) === -1) {
        getArrowsLinesByIds(arrowsId).forEach(highlightArrowLines);
    }

    highlightedArrowsArray.push(arrowsId);
};
const unHighlightArrows = (arrowsId) => {
    highlightedArrowsArray.splice(highlightedArrowsArray.indexOf(arrowsId), 1);

    if (highlightedArrowsArray.indexOf(arrowsId) === -1) {
        getArrowsLinesByIds(arrowsId).forEach(unHighlightArrowLines);
    }
};

const highlightCardElement = (card) => {
    const cardElement = $(card);

    if (!cardElement.length) return;

    highlightSvgParent();
    cardElement.addClass(highlightedMode);

    if (viewMode === 'timeline') {
        cardElement.parent('.i-role-timeline-card-holder').addClass(highlightedMode);
    }
};
const unHighlightCardElement = (card) => {
    const cardElement = $(card);

    cardElement.removeClass(highlightedMode);

    if (viewMode === 'timeline') {
        cardElement.parent('.i-role-timeline-card-holder').removeClass(highlightedMode);
    }

    if (!highlightedCardsArray.length) {
        unHighlightSvgParent();
    }
};

const highlightCards = (id) => {
    if (highlightedCardsArray.indexOf(id) === -1) {
        cardsByEntityId[id].forEach(highlightCardElement);
    }
    highlightedCardsArray.push(id);
};
const unHighlightCards = (id) => {
    highlightedCardsArray.splice(highlightedCardsArray.indexOf(id), 1);

    if (highlightedCardsArray.indexOf(id) === -1) {
        cardsByEntityId[id].forEach(unHighlightCardElement);
    }
};

const getArrowId = (main, slave) => `${main}-${slave}`;

const highlightRelation = (main, slave, click) => {
    [String(main), String(slave)].forEach(highlightCards);
    click && highlightArrows(getArrowId(main, slave));
};
const unHighlightRelation = (main, slave, click) => {
    [String(main), String(slave)].forEach(unHighlightCards);
    click && unHighlightArrows(getArrowId(main, slave));
};

const getClickHandler = (fromId, toId, relationType) => () => {
    const arrowId = getArrowId(fromId, toId);
    const notClickedBefore = !clickedArrows[arrowId];

    clickedArrows[arrowId] = notClickedBefore;

    tausTrack({
        name: notClickedBefore ? 'fix-arrow' : 'unfix-arrow',
        fromId,
        toId,
        relationType
    });

    notClickedBefore ? highlightRelation(fromId, toId, true) : unHighlightRelation(fromId, toId, true);

    return false;
};

const clearHighLights = () => {
    [...highlightedArrowsArray].forEach(unHighlightArrows);
    [...highlightedCardsArray].forEach(unHighlightCards);
};

export const bindArrowHighlightInteractions = ($lines, main, slave, relationType) => {
    $lines.on('mouseenter', () => highlightRelation(main, slave));
    $lines.on('mouseleave', () => unHighlightRelation(main, slave));
    $lines.on('mousedown', getClickHandler(main, slave, relationType));
};

export const redrawInteractionsHighlights = () => {
    const highlightedArrowsArrayDub = [...highlightedArrowsArray];
    const highlightedCardsArrayDub = [...highlightedCardsArray];

    clearHighLights();

    highlightedArrowsArrayDub.forEach(highlightArrows);
    highlightedCardsArrayDub.forEach(highlightCards);
};

export const updateInteractionsData = (cardsByEntityId_, arrows_, viewMode_) => {
    cardsByEntityId = cardsByEntityId_;
    arrows = arrows_;
    viewMode = viewMode_;

    getGrid().on('mousedown.highlights', ({target}) => {
        if ($(target).parents().hasClass('i-role-card')) return;

        tausTrack({
            name: 'reset-highlights'
        });
        clearHighLights();
        clickedArrows = {};
    });
};

export const unbindAndResetHighlights = () => {
    clickedArrows = {};
    clearHighLights();
    getGrid().off('mousedown.highlights');
};

