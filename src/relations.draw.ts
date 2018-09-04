import * as $ from 'jquery';
import ViewMode from 'src/const.view.modes';
import RelationsData, { IRelation } from 'src/data';
import { buildCardsByRelationsHighlighter, cleanGridAndCards } from 'src/relation.highlight';
import {
    bindArrowHighlightInteractions,
    redrawInteractionsHighlights,
    unbindAndResetHighlights,
    updateInteractionsData
} from 'src/relations.interactions';
import { IIntersection, intersectRects, IRect } from 'src/utils/intersection';
import * as relationUtils from 'src/utils/relation.lines';
import { createSvgFromTemplate } from 'src/utils/svg';
import { checkForRelationViolationOnBoard } from 'src/utils/violations';
import * as _ from 'underscore';

export type ICardsGroupedByEntityId<T extends HTMLElement = HTMLElement> = Record<string, T[] | undefined>;

export interface IArrow {
    mainEntityId: number;
    slaveEntityId: number;
    arrowId: string;
    relation: IRelation;
    $lines: JQuery<SVGPathElement>;
    getMainElement: () => HTMLElement;
    getSlaveElement: () => HTMLElement;
}

interface ICreateLineOptions {
    cssClass: string;
    bezierCoords: string;
    stroke: string;
    strokeWidth: string;
    fill?: string;
}

const isEmptyRect = ({ width, height }: ClientRect | DOMRect) => !width && !height;

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
        const ids = Object.keys(this.cardsByEntityId).filter((v) => v.match(/^\d+$/)).map((key) => Number(key));

        return this.dataFetcher.load(ids)
            .then((allRelations) => {
                const relations = allRelations
                    .filter(({ entity: { id } }) => this.cardsByEntityId[id])
                    .map((relation, index) => ({ index, ...relation }));

                this.relations = relations;
                this.groupedRelations = _.groupBy(relations, ({ main: { id } }) => id);
            });
    }

    public buildCardsByRelationsHighlighter() {
        return buildCardsByRelationsHighlighter(
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
        const targetCards = this.cardsByEntityId[relation.entity.id];

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

    public _getElementSelectFunction = (id: number, el: T) => () => _.first((this.cardsByEntityId[id] || [])
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
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        line.setAttribute('class', options.cssClass || '');
        line.setAttribute('d', options.bezierCoords);
        line.setAttribute('stroke', options.stroke || 'grey');
        line.setAttribute('fill', options.fill || 'none');
        line.setAttribute('stroke-width', options.strokeWidth || '1');
        return line;
    }

    public drawRelationArrow(relation: IRelation, mainElement: T, slaveElement: T) {
        const { cardRect, targetRect, tableRect, gridRect } = this._getClientRects(mainElement, slaveElement);

        // sometimes cards are removed from grid on draw start
        if (isEmptyRect(cardRect) || isEmptyRect(targetRect)) {
            return;
        }

        const {
            main: { id: mainEntityId },
            entity: { id: slaveEntityId },
            relationType: { name: relationType }
        } = relation;

        const cardPos = this._getPositionFromRect(cardRect, tableRect);
        const targetPos = this._getPositionFromRect(targetRect, tableRect);
        const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, relation);

        if (!points || !this._isValidPoints(points)) {
            return;
        }

        const bezierCoords = relationUtils.generateBezierCoords(points.start, points.end);

        const hasViolations = this.viewMode === ViewMode.BOARD && checkForRelationViolationOnBoard(mainElement, slaveElement);
        const color = relationUtils.getRelationColor(relationType, hasViolations);
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

        line.setAttribute('marker-start', `url(#${relationUtils.getRelationTypeMarkerStartId(relation.relationType, hasViolations)})`);
        line.setAttribute('marker-end', `url(#${relationUtils.getRelationTypeMarkerEndId(relation.relationType, hasViolations)})`);

        this.$svg!.append(line);
        this.$svg!.append(helperLine);

        const $lines = $(helperLine).add(line);

        const arrow: IArrow = {
            $lines,
            mainEntityId,
            slaveEntityId,
            arrowId: `${mainEntityId}-${slaveEntityId}`,
            relation,
            getMainElement: this._getElementSelectFunction(mainEntityId, mainElement),
            getSlaveElement: this._getElementSelectFunction(slaveEntityId, slaveElement)
        };

        bindArrowHighlightInteractions($lines, mainEntityId, slaveEntityId, relationType);

        this.arrows.push(arrow);
    }

    public _updateRelationArrow = (arrow: IArrow) => {
        const mainElement = arrow.getMainElement();
        const slaveElement = arrow.getSlaveElement();

        if (mainElement && slaveElement) {
            arrow.$lines.show();
            const { cardRect, targetRect, tableRect, gridRect } = this._getClientRects(mainElement, slaveElement);
            const cardPos = this._getPositionFromRect(cardRect, tableRect);
            const targetPos = this._getPositionFromRect(targetRect, tableRect);
            const points = this._getIntersectionPoints(cardPos, targetPos, gridRect, arrow.relation);

            if (!points) {
                arrow.$lines.hide();
                return;
            }

            if (this._isValidPoints(points) && !(isEmptyRect(cardRect) || isEmptyRect(targetRect))) {
                const bezierCoords = relationUtils
                    .generateBezierCoords(points.start, points.end);

                arrow.$lines.each((_index, l) => l.setAttribute('d', bezierCoords));
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
                this.applyRelationsAndCards([this.buildCardsByRelationsHighlighter()]);
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
                        this.buildCardsByRelationsHighlighter()
                    ]);
                    redrawInteractionsHighlights();
                });
        }
    }

    public updateRelationsForCard = (id: number) => {
        this.arrows.filter(({ mainEntityId, slaveEntityId }) => mainEntityId === id || slaveEntityId === id).forEach(this._updateRelationArrow);
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
