import $ from 'jquery';
import _ from 'underscore';
import viewModes from './const.view.modes';
import {intersectRects} from './utils/intersection';
import {createSvgFromTemplate} from './utils/svg';
import * as relationUtils from './utils/relation.lines';
import relationDirection from './relationDirections';
import {getHighlightCardsByRelations, cleanGridAndCards} from './relation.highlight';
import {
    bindArrowHighlightInteractions,
    redrawInteractionsHighlights,
    updateInteractionsData,
    unbindAndResetHighlights
} from './relations.interactions';

const isEmptyRect = ({width, height}) => !width && !height;

const ns = 'http://www.w3.org/2000/svg';

export default class RelationsDraw {
    constructor(dataFetcher) {
        this.cardsByEntityId = [];
        this.offset = 0;
        this.groupedRelations = [];
        this.$table = null;
        this.arrows = [];
        this.viewMode = viewModes.BOARD;
        this.dataFetcher = dataFetcher;
    }

    _appendSvgToGrid($svg) {
        this.$grid.append($svg);
    }

    createSvg() {
        const $svg = createSvgFromTemplate(this.$table.width(), this.$table.height());

        this._appendSvgToGrid($svg);
        return $svg;
    }

    updateGridAndTable() {
        this.$grid = $('.i-role-grid');
        this.$table = this._getTable();

        if (this.$grid.length > 0 && this.$table.length > 0) {
            this.cardsByEntityId = this._getCardsGroupedByEntityId();

            if (!this.$svg) {
                this.$svg = this.createSvg();
            }
            return true;
        }
        return false;
    }

    _getTable() {
        return this.$grid.children('table');
    }

    _getCardsGroupedByEntityId() {
        return _.groupBy(this.$grid.find('.i-role-card, .tau-sortable__placeholder').toArray(), (v) => v.getAttribute('data-entity-id'));
    }

    getAndSaveRelations() {
        const ids = Object.keys(this.cardsByEntityId).filter((v) => v.match(/^\d+$/));

        return this.dataFetcher.load(ids)
            .then((allRelations) => {
                const relations = allRelations
                    .filter(({entity: {id}}) => this.cardsByEntityId[id])
                    .map((relation, index) => ({index, ...relation}));

                this.relations = relations;
                this.groupedRelations = _.groupBy(relations, ({main: {id}}) => id);
            });
    }

    highlightCardsByRelations() {
        return getHighlightCardsByRelations(
            this.$grid,
            this.cardsByEntityId,
            this.viewMode
        );
    }

    applyRelationsAndCards(functions) {
        Object.keys(this.groupedRelations)
            .forEach((entityId) => {
                const entityRelations = this.groupedRelations[entityId];
                const entityCards = this.cardsByEntityId[entityId] || [];

                entityCards.forEach((card) => {
                    functions.forEach((func) => func(entityRelations, card));
                });
            });
    }

    _getDrawRelationsForCard = () => {
        updateInteractionsData(this.cardsByEntityId, this.arrows, this.viewMode);
        return this._drawRelationsForCard;
    };

    _drawRelationsForCard = (relations, sourceCard = null) => {
        this._processRelations(relations).forEach((rel) => {
            this.drawRelation(rel, sourceCard || _.first(this.cardsByEntityId[rel.main.id]));
        });
    };

    drawRelation(relation, sourceCard) {
        const targetCards = this.cardsByEntityId[relation.entity.id];

        if (targetCards) {
            this._processTargetCards(targetCards)
                .forEach((targetCard) => this.drawRelationArrow(relation, sourceCard, targetCard));
        }
    }

    _processRelations(relations) {
        return relations;
    }

    _processTargetCards(cards) {
        return cards;
    }

    _getElementSelectFunction = (id, el) => () => _.first((this.cardsByEntityId[id] || [])
        .filter(c => _.isEqual(
            JSON.parse(c.dataset.dataItem).coords || '',
            JSON.parse(el.dataset.dataItem).coords || ''
        )));

    _getClientRects(fromEl, toEl) {
        return {
            cardRect: fromEl.getBoundingClientRect(),
            targetRect: toEl.getBoundingClientRect(),
            tableRect: this.$table[0].getBoundingClientRect(),
            gridRect: this.$table[0].getBoundingClientRect()
        };
    }

    _getPositionFromRect(cardRect, tableRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    _getIntersectionPoints(cardPos, targetPos) {
        return intersectRects(cardPos, targetPos);
    }

    _isValidPoints(points) {
        return !_.some([points.start.x, points.start.y, points.end.x, points.end.y], p => _.isNaN(p));
    }

    _createLine(options) {
        const line = document.createElementNS(ns, 'path');

        line.setAttribute('class', options.cssClass || '');
        line.setAttributeNS(null, 'd', options.bezierCoords);
        line.setAttributeNS(null, 'stroke', options.stroke || 'grey');
        line.setAttributeNS(null, 'fill', options.fill || 'none');
        line.setAttributeNS(null, 'stroke-width', options.strokeWidth || '1');
        return line;
    }

    drawRelationArrow(relation, fromEl, toEl) {
        const {cardRect, targetRect, tableRect, gridRect} = this._getClientRects(fromEl, toEl);

        // sometimes cards are removed from grid on draw start
        if (isEmptyRect(cardRect) || isEmptyRect(targetRect)) return;

        const {
            main: {id: main},
            entity: {id: slave},
            relationType: {name: relationType},
            directionType
        } = relation;

        const arrow = {
            lines: [],
            main,
            slave,
            arrowId: `${main}-${slave}`,
            relation,
            fromEl: this._getElementSelectFunction(main, fromEl),
            toEl: this._getElementSelectFunction(slave, toEl)
        };

        const cardPos = this._getPositionFromRect(cardRect, tableRect);
        const targetPos = this._getPositionFromRect(targetRect, tableRect);
        const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, relation);

        if (points && this._isValidPoints(points)) {
            const bezierCoords = relationUtils.generateBezierCoords(points.start, points.end, directionType === relationDirection.inbound);
            const color = relationUtils.getRelationColor(relationType);
            const helperLine = this._createLine({
                cssClass: 'helperLine',
                bezierCoords,
                stroke: color,
                strokeWidth: '6'
            });

            const line = this._createLine({
                cssClass: 'line',
                bezierCoords,
                stroke: color,
                strokeWidth: '1.2'
            });

            if (directionType === relationDirection.inbound) {
                line.setAttributeNS(null, 'marker-start', `url(#${relationUtils.getInboundRelationTypeMarkerEndId(relation.relationType)})`);
                line.setAttributeNS(null, 'marker-end', `url(#${relationUtils.getRelationTypeMarkerStartId(relation.relationType)})`);

            } else {
                line.setAttributeNS(null, 'marker-start', `url(#${relationUtils.getRelationTypeMarkerStartId(relation.relationType)})`);
                line.setAttributeNS(null, 'marker-end', `url(#${relationUtils.getOutboundRelationTypeMarkerEndId(relation.relationType)})`);
            }

            this.$svg.append(line);
            this.$svg.append(helperLine);

            const $lines = $(helperLine).add(line);

            arrow.$lines = $lines;

            bindArrowHighlightInteractions($lines, main, slave, relationType);

            this.arrows.push(arrow);
        }
    }

    _updateRelationArrow = (arrow) => {
        const fromEl = arrow.fromEl();
        const toEl = arrow.toEl();

        if (fromEl && toEl) {
            arrow.$lines.show();
            const {cardRect, targetRect, tableRect, gridRect} = this._getClientRects(fromEl, toEl);
            const cardPos = this._getPositionFromRect(cardRect, tableRect);
            const targetPos = this._getPositionFromRect(targetRect, tableRect);
            const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, arrow.relation);

            if (!points) {
                arrow.$lines.hide();
                return;
            }

            if (this._isValidPoints(points) && !(isEmptyRect(cardRect) || isEmptyRect(targetRect))) {
                const bezierCoords = relationUtils
                    .generateBezierCoords(points.start, points.end, arrow.relation.directionType === relationDirection.inbound);

                arrow.$lines.each((index, l) => l.setAttributeNS(null, 'd', bezierCoords));
            } else {
                arrow.$lines.remove();
                _.compact(this.arrows);
            }
        } else {
            arrow.$lines.hide();
        }
    };

    update = (offset) => {
        if (this.$svg) {
            if (offset) {
                this.offset = offset.y;
            }

            if (this.updateGridAndTable()) {
                this.arrows.forEach(this._updateRelationArrow);
                this.applyRelationsAndCards([this.highlightCardsByRelations()]);
            }
        }
    };

    redraw = () => {
        if (this.updateGridAndTable()) {
            this.arrows = [];
            this.$svg.find('path.line, path.helperLine').remove();

            this.getAndSaveRelations()
                .then(() => {
                    if (!this.$svg) return;

                    this.applyRelationsAndCards([
                        this._getDrawRelationsForCard(),
                        this.highlightCardsByRelations()
                    ]);
                    redrawInteractionsHighlights(this.arrows, this.cardsByEntityId, this.viewMode);
                });
        }
    };

    updateRelationsForCard = (id) => {
        this.arrows.filter(({main, slave}) => main === id || slave === id).forEach(this._updateRelationArrow);
    };

    removeAll() {
        cleanGridAndCards(this.$grid);
        unbindAndResetHighlights();
        this.removeSvg();
    }

    removeSvg() {
        if (this.$svg) {
            this.$svg.remove();
            this.$svg = null;
        }
    }
}
