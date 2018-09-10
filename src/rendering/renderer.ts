import * as $ from 'jquery';
import Application from 'src/application';
import { buildCardsHighlighter, cleanGridAndCards } from 'src/card_highlighter';
import { IRelation } from 'src/data';
import { IIntersection, intersectRects, IRect } from 'src/utils/intersection';
import * as relationUtils from 'src/utils/relation.lines';
import { createSvgFromTemplate } from 'src/utils/svg';
import ViewMode from 'src/view_mode';
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

export default class Renderer<T extends HTMLElement = HTMLElement> {
    protected cardsById: ICardsGroupedByEntityId<T> = {};
    protected offset = 0;
    protected $table!: JQuery;
    protected $grid!: JQuery;
    protected $svg: JQuery | null = null;
    protected viewMode = ViewMode.BOARD;
    private application: Application;
    private relationsByMainEntityId: Record<string, IRelation[]> = {};
    private arrows: IArrow[] = [];

    constructor(application: Application) {
        this.application = application;
    }

    public update = (offset?: { y: number }) => {
        if (this.$svg) {
            if (offset) {
                this.offset = offset.y;
            }

            if (this.updateGridAndTable()) {
                this.arrows.forEach(this.updateRelationArrow);
                this.iterateThroughCardsWithRelations([this.buildCardsHighlighter()]);
            }
        }
    }

    public redraw = () => {
        if (this.updateGridAndTable()) {
            this.arrows = [];
            this.$svg!.find('path.line, path.helperLine').remove();

            Promise.all([this.getAndSaveRelations(), this.application.validationStrategy.initialize()]).then(() => {
                if (!this.$svg) {
                    return;
                }

                this.iterateThroughCardsWithRelations([
                    this.buildRelationsDrawer(),
                    this.buildCardsHighlighter()
                ]);
                this.application.interactionModel.redrawInteractionsHighlights();
                this.application.violationFocusModel.setArrows(this.arrows);
            });
        }
    }

    public updateRelationsForCard = (id: number) => {
        this.arrows.filter(({ mainEntityId, slaveEntityId }) => mainEntityId === id || slaveEntityId === id).forEach(this.updateRelationArrow);
    }

    public removeAll() {
        cleanGridAndCards(this.$grid);
        this.application.interactionModel.unbindAndResetHighlights();
        this.removeSvg();
    }

    protected _appendSvgToGrid($svg: JQuery) {
        this.$grid.append($svg);
    }

    protected getTable() {
        return this.$grid.children('table');
    }

    protected getCardsGroupedById() {
        return _.groupBy(this.$grid.find('.i-role-card, .tau-sortable__placeholder').toArray() as T[], (cardElement) => cardElement.getAttribute('data-entity-id'));
    }

    protected processRelations(relations: IRelation[]) {
        return relations;
    }

    protected processTargetCards(cards: T[]) {
        return cards;
    }

    protected getElementSelectFunction = (id: number, el: T) => () => _.first((this.cardsById[id] || [])
        .filter((c) => _.isEqual(
            JSON.parse(c.dataset.dataItem!).coords || '',
            JSON.parse(el.dataset.dataItem!).coords || ''
        )))!

    protected getClientRects(fromEl: HTMLElement, toEl: HTMLElement) {
        return {
            cardRect: fromEl.getBoundingClientRect(),
            targetRect: toEl.getBoundingClientRect(),
            tableRect: this.$table[0].getBoundingClientRect(),
            gridRect: this.$table[0].getBoundingClientRect()
        };
    }

    protected getPositionFromRect(cardRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    protected getIntersectionPoints(cardPos: IRect, targetPos: IRect, _gridRect: ClientRect | DOMRect, _relation: IRelation): IIntersection | null {
        return intersectRects(cardPos, targetPos);
    }

    private createSvg() {
        const $svg = createSvgFromTemplate(this.$table.width()!, this.$table.height()!);

        this._appendSvgToGrid($svg);
        return $svg;
    }

    private updateGridAndTable() {
        this.$grid = $('.i-role-grid');
        this.$table = this.getTable();

        if (this.$grid.length > 0 && this.$table.length > 0) {
            this.cardsById = this.getCardsGroupedById();

            if (!this.$svg) {
                this.$svg = this.createSvg();
            }
            return true;
        }
        return false;
    }

    private getAndSaveRelations() {
        const ids = Object.keys(this.cardsById).filter((v) => v.match(/^\d+$/)).map((key) => Number(key));

        return this.application.dataFetcher.load(ids)
            .then((allRelations) => {
                const relations = allRelations
                    .filter(({ slave: { id } }) => !!this.cardsById[id])
                    .map((relation, index) => ({ index, ...relation }));

                this.relationsByMainEntityId = _.groupBy(relations, ({ main: { id } }) => id);
            });
    }

    private buildCardsHighlighter() {
        return buildCardsHighlighter(
            this.$grid,
            this.cardsById,
            this.viewMode
        );
    }

    private iterateThroughCardsWithRelations(functions: Array<(relations: IRelation[], card: T) => void>) {
        Object.keys(this.relationsByMainEntityId)
            .forEach((entityId) => {
                const relations = this.relationsByMainEntityId[entityId];
                const cards = this.cardsById[entityId] || [];

                cards.forEach((card) => {
                    functions.forEach((func) => func(relations, card));
                });
            });
    }

    private buildRelationsDrawer = () => {
        this.application.interactionModel.updateInteractionsData(this.cardsById, this.arrows, this.viewMode);
        return this.drawRelationsForCard;
    }

    private drawRelationsForCard = (relations: IRelation[], sourceCard: T | null = null) => {
        this.processRelations(relations).forEach((rel) => {
            this.drawRelation(rel, sourceCard || _.first(this.cardsById[rel.main.id]!)!);
        });
    }

    private drawRelation(relation: IRelation, sourceCard: T) {
        const targetCards = this.cardsById[relation.slave.id];

        if (targetCards) {
            this.processTargetCards(targetCards)
                .forEach((targetCard) => this.drawRelationArrow(relation, sourceCard, targetCard));
        }
    }

    private isValidPoints(points: IIntersection) {
        return !_.some([points.start.x, points.start.y, points.end.x, points.end.y], (p) => _.isNaN(p));
    }

    private createLine(options: ICreateLineOptions) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        line.setAttribute('class', options.cssClass || '');
        line.setAttribute('d', options.bezierCoords);
        line.setAttribute('stroke', options.stroke || 'grey');
        line.setAttribute('fill', options.fill || 'none');
        line.setAttribute('stroke-width', options.strokeWidth || '1');
        return line;
    }

    private drawRelationArrow(relation: IRelation, mainElement: T, slaveElement: T) {
        const { cardRect, targetRect, tableRect, gridRect } = this.getClientRects(mainElement, slaveElement);

        // sometimes cards are removed from grid on draw start
        if (isEmptyRect(cardRect) || isEmptyRect(targetRect)) {
            return;
        }

        const {
            main: { id: mainEntityId },
            slave: { id: slaveEntityId },
            relationType: { name: relationType }
        } = relation;

        const cardPos = this.getPositionFromRect(cardRect, tableRect);
        const targetPos = this.getPositionFromRect(targetRect, tableRect);
        const points = this.getIntersectionPoints(cardPos, targetPos, gridRect, relation);

        if (!points || !this.isValidPoints(points)) {
            return;
        }

        const bezierCoords = relationUtils.generateBezierCoords(points.start, points.end);

        const hasViolations = this.application.validationStrategy.isRelationViolated(mainElement, slaveElement);
        const color = relationUtils.getRelationColor(relationType, hasViolations);
        const helperLine = this.createLine({
            cssClass: 'helperLine',
            bezierCoords,
            stroke: color,
            strokeWidth: '6'
        });

        const line = this.createLine({
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
            getMainElement: this.getElementSelectFunction(mainEntityId, mainElement),
            getSlaveElement: this.getElementSelectFunction(slaveEntityId, slaveElement)
        };

        this.application.interactionModel.bindArrowHighlightInteractions($lines, mainEntityId, slaveEntityId, relationType);

        this.arrows.push(arrow);
    }

    private updateRelationArrow = (arrow: IArrow) => {
        const mainElement = arrow.getMainElement();
        const slaveElement = arrow.getSlaveElement();

        if (mainElement && slaveElement) {
            arrow.$lines.show();
            const { cardRect, targetRect, tableRect, gridRect } = this.getClientRects(mainElement, slaveElement);
            const cardPos = this.getPositionFromRect(cardRect, tableRect);
            const targetPos = this.getPositionFromRect(targetRect, tableRect);
            const points = this.getIntersectionPoints(cardPos, targetPos, gridRect, arrow.relation);

            if (!points) {
                arrow.$lines.hide();
                return;
            }

            if (this.isValidPoints(points) && !(isEmptyRect(cardRect) || isEmptyRect(targetRect))) {
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

    private removeSvg() {
        if (this.$svg) {
            this.$svg.remove();
            this.$svg = null;
        }
    }
}
