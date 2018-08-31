import * as $ from 'jquery';
import tausTrack from 'src/relations.taus';

import ViewMode from 'src/const.view.modes';
import { IArrow, ICardsGroupedByEntityId } from 'src/relations.draw';

const highlightedMode = 'mashupCustomUnitShowRelations__highlighted';
const highlightedElement = 'mashupCustomUnitShowRelations-highlighted mashupCustomUnitShowRelations__svg-highlighted';

const highlightedArrowsArray: string[] = [];
const highlightedCardsArray: string[] = [];
let arrows: IArrow[] = [];
let cardsByEntityId: ICardsGroupedByEntityId = {};
let viewMode: ViewMode | null = null;
let clickedArrows: Record<string, boolean | undefined> = {};

const getGrid = () => $('.i-role-grid');

const highlightSvgParent = () => getGrid().addClass(highlightedElement);
const unHighlightSvgParent = () => getGrid().removeClass(highlightedElement);

const highlightArrowLines = ($lines: JQuery<SVGPathElement>) => $($lines).filter('.line').attr('class', 'line line__highlighted');
const unHighlightArrowLines = ($lines: JQuery<SVGPathElement>) => $($lines).filter('.line').attr('class', 'line');

const getArrowsLinesByIds = (id: string) => arrows.filter(({ arrowId }) => arrowId === id).map(({ $lines }) => $lines);

const highlightArrows = (arrowsId: string) => {
    if (highlightedArrowsArray.indexOf(arrowsId) === -1) {
        getArrowsLinesByIds(arrowsId).forEach(highlightArrowLines);
    }

    highlightedArrowsArray.push(arrowsId);
};
const unHighlightArrows = (arrowsId: string) => {
    highlightedArrowsArray.splice(highlightedArrowsArray.indexOf(arrowsId), 1);

    if (highlightedArrowsArray.indexOf(arrowsId) === -1) {
        getArrowsLinesByIds(arrowsId).forEach(unHighlightArrowLines);
    }
};

const highlightCardElement = (card: HTMLElement) => {
    const cardElement = $(card);

    if (!cardElement.length) {
        return;
    }

    highlightSvgParent();
    cardElement.addClass(highlightedMode);

    if (viewMode === 'timeline') {
        cardElement.parent('.i-role-timeline-card-holder').addClass(highlightedMode);
    }
};
const unHighlightCardElement = (card: HTMLElement) => {
    const cardElement = $(card);

    cardElement.removeClass(highlightedMode);

    if (viewMode === 'timeline') {
        cardElement.parent('.i-role-timeline-card-holder').removeClass(highlightedMode);
    }

    if (!highlightedCardsArray.length) {
        unHighlightSvgParent();
    }
};

const highlightCards = (id: string) => {
    if (highlightedCardsArray.indexOf(id) === -1) {
        cardsByEntityId[id]!.forEach(highlightCardElement);
    }
    highlightedCardsArray.push(id);
};
const unHighlightCards = (id: string) => {
    highlightedCardsArray.splice(highlightedCardsArray.indexOf(id), 1);

    if (highlightedCardsArray.indexOf(id) === -1) {
        cardsByEntityId[id]!.forEach(unHighlightCardElement);
    }
};

const getArrowId = (main: string, slave: string) => `${main}-${slave}`;

const highlightRelation = (main: string, slave: string, click = false) => {
    [String(main), String(slave)].forEach(highlightCards);
    click && highlightArrows(getArrowId(main, slave));
};
const unHighlightRelation = (main: string, slave: string, click = false) => {
    [String(main), String(slave)].forEach(unHighlightCards);
    click && unHighlightArrows(getArrowId(main, slave));
};

const getClickHandler = (fromId: string, toId: string, relationType: string) => () => {
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

export const bindArrowHighlightInteractions = ($lines: JQuery<SVGPathElement>, main: string, slave: string, relationType: string) => {
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

export const updateInteractionsData = (updatedCardsByEntityId: ICardsGroupedByEntityId, updatedArrows: IArrow[], updatedViewMode: ViewMode) => {
    cardsByEntityId = updatedCardsByEntityId;
    arrows = updatedArrows;
    viewMode = updatedViewMode;

    getGrid().on('mousedown.highlights', ({ target }) => {
        if ($(target).parents().hasClass('i-role-card')) {
            return;
        }

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
