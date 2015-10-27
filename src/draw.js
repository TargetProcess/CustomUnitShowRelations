import $ from 'jquery';
import _ from 'underscore';
import {getAppConfigurator} from 'targetprocess-mashup-helper/lib/configurator';

import {intersectRects} from './utils/intersection';

let $table;
let $svg;
let $legend;
let viewType;
let $grid;
let cardsByEntityId = {};
let selectedCardIds = [];

import legendTemplate from './templates/legend.html';
import svgTemplate from './templates/svg.html';

const relationTypes = [
    {
        name: 'Dependency',
        style: '#000000'
    },
    {
        name: 'Blocker',
        style: '#bd0010'
    },
    {
        name: 'Relation',
        style: '#aaa'
    },
    {
        name: 'Link',
        style: '#36ab45'
    },
    {
        name: 'Duplicate',
        style: '#ff5400'
    }
];

const getCardsByEntityId = (entityId) => cardsByEntityId[entityId] || [];

const getRelationTypeColor = ({style}) => style;

const getRelationColor = (relation) => {

    const relationType = _.findWhere(relationTypes, {
        name: relation.relationType.name
    });

    return getRelationTypeColor(relationType);

};

const getRelationTypeMarkerStartId = ({name}) => `${name}_start`;
const getInboundRelationTypeMarkerEndId = ({name}) => `${name}_inbound_end`;
const getOutboundRelationTypeMarkerEndId = ({name}) => `${name}_outbound_end`;

const getRelationMarkerStartId = ({relationType}) => getRelationTypeMarkerStartId(relationType);
const getInboundRelationMarkerEndId = ({relationType}) => getInboundRelationTypeMarkerEndId(relationType);
const getOutboundRelationMarkerEndId = ({relationType}) => getOutboundRelationTypeMarkerEndId(relationType);

const highlightRelationArrow = (fromEl, toEl, line) => {

    $grid.addClass('mashupCustomUnitShowRelations-highlighted');
    $(fromEl).addClass('mashupCustomUnitShowRelations__highlighted');
    $(toEl).addClass('mashupCustomUnitShowRelations__highlighted');

    $svg.parent().addClass('mashupCustomUnitShowRelations__svg-highlighted');
    $(line).css('opacity', 1);

};

const unhighlightRelationArrow = (fromEl, toEl, line) => {

    $grid.removeClass('mashupCustomUnitShowRelations-highlighted');
    $(fromEl).removeClass('mashupCustomUnitShowRelations__highlighted');
    $(toEl).removeClass('mashupCustomUnitShowRelations__highlighted');

    $svg.parent().removeClass('mashupCustomUnitShowRelations__svg-highlighted');
    $(line).removeAttr('style');

};

const generateBezierCoords = (start, end, down = false) => {

    let points = [`M${start.x},${start.y}`];

    const rad = Math.PI / 48 * (down ? -1 : 1);

    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const centerOnLine = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };

    const centerRot = {
        x: (centerOnLine.x - start.x) * cos - (centerOnLine.y - start.y) * sin + start.x,
        y: (centerOnLine.x - start.x) * sin + (centerOnLine.y - start.y) * cos + start.y
    };

    const center = `${centerRot.x},${centerRot.y}`;

    points = points.concat(`C${center}`);
    points = points.concat(center);

    return points.concat(`${end.x},${end.y}`).join(' ');

};

const drawRelationArrow = (relation, fromEl, toEl) => {

    const ns = 'http://www.w3.org/2000/svg';
    const cardRect = fromEl.getBoundingClientRect();
    const targetRect = toEl.getBoundingClientRect();
    const tableRect = $table[0].getBoundingClientRect();

    const cardPos = {
        x: cardRect.left - tableRect.left,
        y: cardRect.top - tableRect.top,
        height: cardRect.height,
        width: cardRect.width
    };

    const targetPos = {
        x: targetRect.left - tableRect.left,
        y: targetRect.top - tableRect.top,
        height: targetRect.height,
        width: targetRect.width
    };

    const points = intersectRects(cardPos, targetPos);

    // if list, make income relations to the left, outcome to right of card
    if (viewType === 'list') {

        const offset = ((relation.index || 0) + 1) * 50;

        if (relation.directionType === 'inbound') {

            points.start.x = cardPos.x + offset;
            points.end.x = targetPos.x + offset;

        } else {

            points.start.x = cardPos.x + cardPos.width - offset;
            points.end.x = targetPos.x + targetPos.width - offset;

        }

    }

    const bezierCoords = generateBezierCoords(points.start, points.end, relation.directionType === 'inbound');

    const color = getRelationColor(relation);

    const helperLine = document.createElementNS(ns, 'path');

    helperLine.setAttribute('class', 'helperline');
    helperLine.setAttributeNS(null, 'd', bezierCoords);
    helperLine.setAttributeNS(null, 'stroke', 'grey');
    helperLine.setAttributeNS(null, 'fill', 'none');
    helperLine.setAttributeNS(null, 'stroke-width', '20');

    $svg[0].appendChild(helperLine);

    const line = document.createElementNS(ns, 'path');

    line.setAttribute('class', 'line');
    line.setAttributeNS(null, 'd', bezierCoords);
    line.setAttributeNS(null, 'stroke', color);
    line.setAttributeNS(null, 'fill', 'none');
    line.setAttributeNS(null, 'stroke-width', '2');

    if (relation.directionType === 'inbound') {

        line.setAttributeNS(null, 'marker-start', `url(#${getInboundRelationMarkerEndId(relation)})`);
        line.setAttributeNS(null, 'marker-end', `url(#${getRelationMarkerStartId(relation)})`);

    } else {

        line.setAttributeNS(null, 'marker-start', `url(#${getRelationMarkerStartId(relation)})`);
        line.setAttributeNS(null, 'marker-end', `url(#${getOutboundRelationMarkerEndId(relation)})`);

    }

    $svg[0].appendChild(line);

    const $lines = $(helperLine).add(line);

    $lines.on('mouseenter', () => highlightRelationArrow(fromEl, toEl, line));
    $lines.on('mouseleave', () => unhighlightRelationArrow(fromEl, toEl, line));

    $lines.on('click', (e) => e.stopPropagation());

};

const hideSelection = (card) => {

    const $card = $(card);

    if ($card.hasClass('tau-selected')) {

        $card.removeClass('tau-selected');
        selectedCardIds = selectedCardIds.concat($card.data('id'));

    }

};

const restoreSelection = () => {

    selectedCardIds.forEach((id) => $grid.find(`.i-role-card[data-id=${id}]`).addClass('tau-selected'));
    selectedCardIds = [];

};

const highlightCard = (card, color, directionType, {outline}) => {

    let $el = $(card);

    if (viewType === 'timeline') {

        const $parent = $el.parent('.i-role-timeline-card-holder');

        if ($parent.length) {

            hideSelection($el);

            $el.addClass('mashupCustomUnitShowRelations__related');
            $el.addClass(`mashupCustomUnitShowRelations__${directionType}`);

            $el = $parent;

        }

    }

    hideSelection($el);
    $el.addClass('mashupCustomUnitShowRelations__related');

    if (outline) {

        $el.addClass(`mashupCustomUnitShowRelations__related-${directionType}`);
        $el.css('outline-color', color);

    }

};

const highlightCardsByRelation = (relation, options) => {

    const color = getRelationColor(relation);

    getCardsByEntityId(relation.entity.id).forEach((card) => {

        highlightCard(card, color, relation.directionType, options);

    });

};

const drawRelationArrows = (relation, sourceCard) => {

    if (viewType === 'timeline') return null;

    const targetCards = getCardsByEntityId(relation.entity.id);

    targetCards.forEach((targetCard) => drawRelationArrow(relation, sourceCard, targetCard));

};

const cleanGridAndCards = () => {

    if ($grid) {

        $grid.removeClass('mashupCustomUnitShowRelations');
        $grid.removeClass('mashupCustomUnitShowRelations-highlighted');

        ['related', 'related-inbound', 'related-outbound', 'source'].forEach((v) => {

            const className = `mashupCustomUnitShowRelations__${v}`;

            $grid.find(`.${className}`).removeClass(className);

        });

    }

};

const removeSvg = () => {

    if ($svg) {

        $svg.remove();
        $svg = null;

    }

};

const removeLegend = () => {

    if ($legend) {

        $legend.remove();
        $legend = null;

    }

};

const drawRelation = (relation, sourceCard) => {

    drawRelationArrows(relation, sourceCard);

};

export const drawLegend = (relations, entityId, entityType) => {

    const existingNames = relations
        .filter((v) => getCardsByEntityId(v.entity.id).length)
        .map((v) => v.relationType.name);

    const existingRelationTypes = relationTypes.filter((v) => existingNames.indexOf(v.name) >= 0);

    $legend = $(legendTemplate({
        relationTypes: existingRelationTypes,
        showMessage: entityId && existingNames.length < relations.length,
        getRelationTypeColor
    }));

    $grid.parent().append($legend);

    if (entityId) {

        $legend.on('click', 'a', () => {

            getAppConfigurator().then((c) => {

                c.getEntityViewService().showEntityView({
                    entityId,
                    entityType
                });

            });

        });

    }

};

export const drawRelations = (relations, sourceCard_ = null) => {

    let processedRelations = relations
        .filter((v) => getCardsByEntityId(v.entity.id).length);

    if (viewType === 'list') {

        processedRelations = _.groupBy(processedRelations, (v) => v.directionType);
        processedRelations = _.map(processedRelations, (list) => list.map((v, k) => ({index: k, ...v})));
        processedRelations = _.reduce(processedRelations, (res, v) => res.concat(v), []);

    }

    processedRelations.forEach((rel) => {

        const sourceCard = sourceCard_ || _.first(getCardsByEntityId(rel.main.id));

        drawRelation(rel, sourceCard);

    });

};

export const highlightCardsByRelations = (relations, sourceCard, options = {outline: true}) => {

    $grid.addClass('mashupCustomUnitShowRelations');
    $(sourceCard).addClass('mashupCustomUnitShowRelations__source');
    hideSelection(sourceCard);

    relations.forEach((relation) => highlightCardsByRelation(relation, options));

};

export const removeAllDrawn = () => {

    cleanGridAndCards();
    removeSvg();
    removeLegend();
    restoreSelection();

};

export const createSvg = () => {

    $grid = $('.i-role-grid');
    $table = $grid.children('table');
    cardsByEntityId = _.groupBy($grid.find('.i-role-card').toArray(), (v) => v.getAttribute('data-entity-id'));

    viewType = 'board';

    if (!$table.length) {

        $table = $grid.find('.i-role-list-root-container');
        viewType = 'list';

    }

    if (!$table.length) {

        $table = $grid.find('.tau-timeline-flow');
        viewType = 'timeline';

    }

    const height = $table.height();
    const width = $table.width();

    $svg = $(svgTemplate({
        relationTypes, width, height, getRelationTypeColor, getRelationTypeMarkerStartId,
        getInboundRelationTypeMarkerEndId, getOutboundRelationTypeMarkerEndId
    }));

    if (viewType === 'list') {

        $grid.find('.i-role-unit-editor-popup-position-within').append($svg);

    } else if (viewType === 'timeline') {

        $grid.find('.tau-timeline-canvas').append($svg);

    } else {

        $grid.append($svg);

    }

    return $svg;

};

