import * as $ from 'jquery';
import ViewMode from 'src/const.view.modes';
import RelationsData, { IRelation } from 'src/data';
import { cleanGridAndCards, getHighlightCardsByRelations } from 'src/relation.highlight';
import DirectionType from 'src/relationDirections';
import {
    bindArrowHighlightInteractions,
    redrawInteractionsHighlights,
    unbindAndResetHighlights,
    updateInteractionsData
} from 'src/relations.interactions';
import { IIntersection, intersectRects, IRect } from 'src/utils/intersection';
import * as relationUtils from 'src/utils/relation.lines';
import { createSvgFromTemplate } from 'src/utils/svg';
import * as _ from 'underscore';

export type ICardsGroupedByEntityId<T extends HTMLElement = HTMLElement> = Record<string, T[] | undefined>;

export interface IArrow {
    main: string;
    slave: string;
    arrowId: string;
    relation: IRelation;
    $lines: JQuery<SVGPathElement>;
    fromEl: () => HTMLElement;
    toEl: () => HTMLElement;
}

interface ICreateLineOptions {
    cssClass: string;
    bezierCoords: string;
    stroke: string;
    strokeWidth: string;
    fill?: string;
}

const isEmptyRect = ({ width, height }: ClientRect | DOMRect) => !width && !height;

const ns = 'http://www.w3.org/2000/svg';

export default class RelationsDraw<T extends HTMLElement = HTMLElement> {
    public cardsByEntityId: ICardsGroupedByEntityId<T> = {};
    public offset = 0;
    public groupedRelations: Record<string, IRelation[]> = {};
    public relations: IRelation[] | null = null;
    public $table!: JQuery;
    public $grid!: JQuery;
    public $svg: JQuery | null = null;
    public arrows: IArrow[] = [];
    public viewMode = ViewMode.BOARD;
    public dataFetcher: RelationsData;

    constructor(dataFetcher: RelationsData) {
        this.dataFetcher = dataFetcher;
    }

    public _appendSvgToGrid($svg: JQuery) {
        this.$grid.append($svg);
    }

    public createSvg() {
        const $svg = createSvgFromTemplate(this.$table.width()!, this.$table.height()!);

        this._appendSvgToGrid($svg);
        return $svg;
    }

    public updateGridAndTable() {
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

    public _getTable() {
        return this.$grid.children('table');
    }

    public _getCardsGroupedByEntityId() {
        return _.groupBy(this.$grid.find('.i-role-card, .tau-sortable__placeholder').toArray() as T[], (v) => v.getAttribute('data-entity-id'));
    }

    public getAndSaveRelations() {
        const ids = Object.keys(this.cardsByEntityId).filter((v) => v.match(/^\d+$/));

        return this.dataFetcher.load(ids)
            .then((allRelations) => {
                const relations = allRelations
                    .filter(({ entity: { id } }) => this.cardsByEntityId[id])
                    .map((relation, index) => ({ index, ...relation }));

                this.relations = relations;
                this.groupedRelations = _.groupBy(relations, ({ main: { id } }) => id);
            });
    }

    public highlightCardsByRelations() {
        return getHighlightCardsByRelations(
            this.$grid,
            this.cardsByEntityId,
            this.viewMode
        );
    }

    public applyRelationsAndCards(functions: Array<(relations: IRelation[], card: T) => void>) {
        Object.keys(this.groupedRelations)
            .forEach((entityId) => {
                const entityRelations = this.groupedRelations[entityId];
                const entityCards = this.cardsByEntityId[entityId] || [];

                entityCards.forEach((card) => {
                    functions.forEach((func) => func(entityRelations, card));
                });
            });
    }

    public _getDrawRelationsForCard = () => {
        updateInteractionsData(this.cardsByEntityId, this.arrows, this.viewMode);
        return this._drawRelationsForCard;
    }

    public _drawRelationsForCard = (relations: IRelation[], sourceCard: T | null = null) => {
        this._processRelations(relations).forEach((rel) => {
            this.drawRelation(rel, sourceCard || _.first(this.cardsByEntityId[rel.main.id]!)!);
        });
    }

    public drawRelation(relation: IRelation, sourceCard: T) {
        const targetCards = this.cardsByEntityId[relation.entity.id]!;

        if (targetCards) {
            this._processTargetCards(targetCards)
                .forEach((targetCard) => this.drawRelationArrow(relation, sourceCard, targetCard));
        }
    }

    public _processRelations(relations: IRelation[]) {
        return relations;
    }

    public _processTargetCards(cards: T[]) {
        return cards;
    }

    public _getElementSelectFunction = (id: string, el: T) => () => _.first((this.cardsByEntityId[id] || [])
        .filter((c) => _.isEqual(
            JSON.parse(c.dataset.dataItem!).coords || '',
            JSON.parse(el.dataset.dataItem!).coords || ''
        )))!

    public _getClientRects(fromEl: HTMLElement, toEl: HTMLElement) {
        return {
            cardRect: fromEl.getBoundingClientRect(),
            targetRect: toEl.getBoundingClientRect(),
            tableRect: this.$table[0].getBoundingClientRect(),
            gridRect: this.$table[0].getBoundingClientRect()
        };
    }

    public _getPositionFromRect(cardRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    public _getIntersectionPoints(cardPos: IRect, targetPos: IRect, _gridRect: ClientRect | DOMRect, _relation: IRelation): IIntersection | null {
        return intersectRects(cardPos, targetPos);
    }

    public _isValidPoints(points: IIntersection) {
        return !_.some([points.start.x, points.start.y, points.end.x, points.end.y], (p) => _.isNaN(p));
    }

    public _createLine(options: ICreateLineOptions) {
        const line = document.createElementNS(ns, 'path');

        line.setAttribute('class', options.cssClass || '');
        line.setAttributeNS(ns, 'd', options.bezierCoords);
        line.setAttributeNS(ns, 'stroke', options.stroke || 'grey');
        line.setAttributeNS(ns, 'fill', options.fill || 'none');
        line.setAttributeNS(ns, 'stroke-width', options.strokeWidth || '1');
        return line;
    }

    public drawRelationArrow(relation: IRelation, fromEl: T, toEl: T) {
        const { cardRect, targetRect, tableRect, gridRect } = this._getClientRects(fromEl, toEl);

        // sometimes cards are removed from grid on draw start
        if (isEmptyRect(cardRect) || isEmptyRect(targetRect)) {
            return;
        }

        const {
            main: { id: main },
            entity: { id: slave },
            relationType: { name: relationType },
            directionType
        } = relation;

        const cardPos = this._getPositionFromRect(cardRect, tableRect);
        const targetPos = this._getPositionFromRect(targetRect, tableRect);
        const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, relation);

        if (points && this._isValidPoints(points)) {
            const bezierCoords = relationUtils.generateBezierCoords(points.start, points.end, directionType === DirectionType.inbound);
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

            if (directionType === DirectionType.inbound) {
                line.setAttributeNS(ns, 'marker-start', `url(#${relationUtils.getInboundRelationTypeMarkerEndId(relation.relationType)})`);
                line.setAttributeNS(ns, 'marker-end', `url(#${relationUtils.getRelationTypeMarkerStartId(relation.relationType)})`);
            } else {
                line.setAttributeNS(ns, 'marker-start', `url(#${relationUtils.getRelationTypeMarkerStartId(relation.relationType)})`);
                line.setAttributeNS(ns, 'marker-end', `url(#${relationUtils.getOutboundRelationTypeMarkerEndId(relation.relationType)})`);
            }

            this.$svg!.append(line);
            this.$svg!.append(helperLine);

            const $lines = $(helperLine).add(line);

            const arrow: IArrow = {
                $lines,
                main,
                slave,
                arrowId: `${main}-${slave}`,
                relation,
                fromEl: this._getElementSelectFunction(main, fromEl),
                toEl: this._getElementSelectFunction(slave, toEl)
            };

            bindArrowHighlightInteractions($lines, main, slave, relationType);

            this.arrows.push(arrow);
        }
    }

    public _updateRelationArrow = (arrow: IArrow) => {
        const fromEl = arrow.fromEl();
        const toEl = arrow.toEl();

        if (fromEl && toEl) {
            arrow.$lines.show();
            const { cardRect, targetRect, tableRect, gridRect } = this._getClientRects(fromEl, toEl);
            const cardPos = this._getPositionFromRect(cardRect, tableRect);
            const targetPos = this._getPositionFromRect(targetRect, tableRect);
            const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, arrow.relation);

            if (!points) {
                arrow.$lines.hide();
                return;
            }

            if (this._isValidPoints(points) && !(isEmptyRect(cardRect) || isEmptyRect(targetRect))) {
                const bezierCoords = relationUtils
                    .generateBezierCoords(points.start, points.end, arrow.relation.directionType === DirectionType.inbound);

                arrow.$lines.each((_index, l) => l.setAttributeNS(ns, 'd', bezierCoords));
            } else {
                arrow.$lines.remove();
                _.compact(this.arrows);
            }
        } else {
            arrow.$lines.hide();
        }
    }

    public update = (offset?: { y: number }) => {
        if (this.$svg) {
            if (offset) {
                this.offset = offset.y;
            }

            if (this.updateGridAndTable()) {
                this.arrows.forEach(this._updateRelationArrow);
                this.applyRelationsAndCards([this.highlightCardsByRelations()]);
            }
        }
    }

    public redraw = () => {
        if (this.updateGridAndTable()) {
            this.arrows = [];
            this.$svg!.find('path.line, path.helperLine').remove();

            this.getAndSaveRelations()
                .then(() => {
                    if (!this.$svg) {
                        return;
                    }

                    this.applyRelationsAndCards([
                        this._getDrawRelationsForCard(),
                        this.highlightCardsByRelations()
                    ]);
                    redrawInteractionsHighlights();
                });
        }
    }

    public updateRelationsForCard = (id: string) => {
        this.arrows.filter(({ main, slave }) => main === id || slave === id).forEach(this._updateRelationArrow);
    }

    public removeAll() {
        cleanGridAndCards(this.$grid);
        unbindAndResetHighlights();
        this.removeSvg();
    }

    public removeSvg() {
        if (this.$svg) {
            this.$svg.remove();
            this.$svg = null;
        }
    }
}
