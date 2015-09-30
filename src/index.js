/* eslint id-length: 0 */

import $ from 'jquery';
import configurator from 'tau/configurator';
import helper from 'targetprocess-mashup-helper';

import './index.css';

let $card;
let $table;
let $svg;
const ns = 'http://www.w3.org/2000/svg';
let isList;
let cardId;

var intersectSlices = ({x1: x11, x2: x12, y1: y11, y2: y12}, {x1: x21, x2: x22, y1: y21, y2: y22}) => {

    var y = (y11 * (y22 - y21) * (x12 - x11) -
        y21 * (y12 - y11) * (x22 - x21) +
        (x21 - x11) * (y22 - y21) * (y12 - y11)) /
        ((y22 - y21) * (x12 - x11) - (y12 - y11) * (x22 - x21));

    var x = (x11 * (x22 - x21) * (y12 - y11) -
        x21 * (x12 - x11) * (y22 - y21) +
        (y21 - y11) * (x22 - x21) * (x12 - x11)) /
        ((x22 - x21) * (y12 - y11) - (x12 - x11) * (y22 - y21));

    return {
        x: x,
        y: y
    };

};

const getSlicesByRect = (rect) => {

    return [{
        x1: rect.x,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y,
    }, {
        x1: rect.x + rect.width,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height,
    }, {
        x1: rect.x,
        y1: rect.y + rect.height,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height,
    }, {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x,
        y2: rect.y + rect.height,
    }];

};

const checkInSlices = (point, s1, s2) => {

    const isX1 = point.x >= Math.min(s1.x1, s1.x2) && point.x <= Math.max(s1.x1, s1.x2);
    const isX2 = point.x >= Math.min(s2.x1, s2.x2) && point.x <= Math.max(s2.x1, s2.x2);

    const isY1 = point.y >= Math.min(s1.y1, s1.y2) && point.y <= Math.max(s1.y1, s1.y2);
    const isY2 = point.y >= Math.min(s2.y1, s2.y2) && point.y <= Math.max(s2.y1, s2.y2);

    return isX1 && isX2 && isY1 && isY2;

};

const intersectRect = (rect, sc) => {

    const rectSlices = getSlicesByRect(rect);

    let intersectStart;

    rectSlices.forEach((slice) => {

        const p = intersectSlices(slice, sc);

        if (checkInSlices(p, sc, slice)) {

            intersectStart = p;

        }

    });

    return intersectStart;

};

const intersectRects = (rect1, rect2) => {

    const sc = {
        x1: rect1.x + rect1.width / 2,
        y1: rect1.y + rect1.height / 2,
        x2: rect2.x + rect2.width / 2,
        y2: rect2.y + rect2.height / 2
    };

    return {
        start: intersectRect(rect1, sc),
        end: intersectRect(rect2, sc),
    };

};

const getRelations = (entityId) => {

    return $.ajax({
        url: `${configurator.getApplicationPath()}/api/v1/generals/${entityId}?include=[MasterRelations[Master,RelationType],SlaveRelations[Slave,RelationType]]&format=json`,
        contentType: 'application/json; charset=utf-8'
    })
    .then((res) => {

        const data = res.MasterRelations.Items.map((v) => ({
            directionType: 'master',
            relationType: {
                name: v.RelationType.Name
            },
            entity: {
                id: v.Master.Id
            }
        })).concat(res.SlaveRelations.Items.map((v) => ({
            directionType: 'slave',
            relationType: {
                name: v.RelationType.Name
            },
            entity: {
                id: v.Slave.Id
            }
        })));

        return data;

    })
    .fail(() => {});

};

const generateBezier = (start, end) => {

    let points = [`M${start.x},${start.y}`];

    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    // const half = Math.sqrt(Math.pow(centerX - start.x, 2) + Math.pow(centerY - start.Y, 2));
    // const kat = half * Math.tan(Math.PI / 6);

    const center = `${centerX * 1},${centerY * 1.01}`;

    points = points.concat(`C${center}`);
    points = points.concat(center);

    return points.concat(`${end.x},${end.y}`).join(' ');

};

const drawArrow = (fromEl, toEl) => {

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

    if (isList) {

        const offset = Math.random() * 500 * (Math.random() > 0.5 ? 1 : -1);

        points.start.x = points.start.x + offset;
        points.end.x = points.end.x + offset;

    }

    const line = document.createElementNS(ns, 'path');

    line.setAttributeNS(null, 'd', generateBezier(points.start, points.end));
    line.setAttributeNS(null, 'stroke', 'purple');
    line.setAttributeNS(null, 'fill', 'none');
    line.setAttributeNS(null, 'stroke-width', '2');
    line.setAttributeNS(null, 'marker-end', 'url(#end)');
    line.setAttributeNS(null, 'marker-start', 'url(#start)');

    $svg[0].appendChild(line);

};

const highlightRelation = (relation) => {

    const $target = $(`.i-role-card[data-entity-id=${relation.entity.id}]`);

    if ($target.length) {

        $target.addClass('mashupCustomUnitShowRelations__related');
        $target.addClass(relation.directionType === 'master' ? 'mashupCustomUnitShowRelations__related-inbound' : 'mashupCustomUnitShowRelations__related-outbound');

        $target.each((k, v) => {

            if (relation.directionType === 'master') {

                drawArrow(v, $card[0]);

            } else {

                drawArrow($card[0], v);

            }

        });



    }

};

const unhighlightRelated = () => {

    const $grid = $('.i-role-grid');

    $grid.removeClass('mashupCustomUnitShowRelations');
    $grid.find('.i-role-card').removeClass('mashupCustomUnitShowRelations__related');
    $grid.find('.i-role-card').removeClass('mashupCustomUnitShowRelations__related-inbound');
    $grid.find('.i-role-card').removeClass('mashupCustomUnitShowRelations__related-outbound');
    $grid.find('.i-role-card').removeClass('mashupCustomUnitShowRelations__source');
    $svg.remove();

};

const highlightRelated = (cardId, relations) => {

    const $grid = $('.i-role-grid');

    isList = false;

    $table = $grid.children('table');
    if (!$table.length) {

        $table = $grid.find('.i-role-list-root-container');
        isList = true;

    }

    const height = $table.height();
    const width = $table.width();

    $grid.addClass('mashupCustomUnitShowRelations');

    $svg = $(`
        <svg xmlns="http://www.w3.org/2000/svg" class="mashupCustomUnitShowRelations__svg" fill="pink" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
            <defs>
                <marker id="start" markerWidth="7" markerHeight="7" refX="5" refY="5">
                    <circle cx="5" cy="5" r="2" style="stroke: none; fill:purple;"/>
                </marker>
                <marker id="end" markerWidth="4" markerHeight="4" orient="auto" refY="2">
                    <path d="M0,0 L4,2 0,4" fill="purple" />
                </marker>
            </defs>
        </svg>`);

    $svg.on('click', unhighlightRelated);

    $card = $grid.find(`.i-role-card[data-id=${cardId}]`);
    $card.addClass('mashupCustomUnitShowRelations__source');

    if (isList) {
        $grid.find('.i-role-unit-editor-popup-position-within').append($svg);
    } else {
        $grid.append($svg);
    }



    relations.forEach(highlightRelation);

};

helper.customUnits.add({
    id: 'my_entity_state',
    name: 'show relations',
    template: '<div class="tau-board-unit__value"><button type="button" class="cu-showrelations">Show relations</button></div>',
    hideIf: ({masterRelations, slaveRelations}) => !masterRelations.items.length && !slaveRelations.items.length,
    model: {
        masterRelations: 'MasterRelations',
        slaveRelations: 'SlaveRelations'
    },
    sampleData: {
        masterRelations: [],
        slaveRelations: []
    }
});

$(document.body).on('click', '.cu-showrelations', (e) => {

    e.stopPropagation();
    e.preventDefault();

    const entityId = $(e.target).parents('.i-role-card').data('entityId');
    cardId = $(e.target).parents('.i-role-card').data('id');





    // if (!$card.hasClass('tau-selected')) {

        getRelations(entityId)
            .then((relations) => highlightRelated(cardId, relations));

    // }

});
