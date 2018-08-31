import * as $ from 'jquery';
import viewModes from 'src/const.view.modes';
import RelationsData from 'src/data';
import RelationsDraw from 'src/relations.draw';
import { intersectRects, IRect } from 'src/utils/intersection';
import * as _ from 'underscore';

interface ICardElementWithMetadata extends HTMLElement {
    sectionType: string;
    holder: HTMLElement;
    coords: string;
}

export default class RelationsDrawTimeline extends RelationsDraw<ICardElementWithMetadata> {
    constructor(dataFetcher: RelationsData) {
        super(dataFetcher);
        this.viewMode = viewModes.TIMELINE;
    }

    public _appendSvgToGrid($svg: JQuery) {
        this.$grid.find('.tau-timeline.i-role-timeline-column').append($svg);
    }

    public _getCardsGroupedByEntityId() {
        const groupedCards = _.groupBy(
            [
                ...this.$grid.find('.tau-backlog-body .i-role-card, .tau-backlog-body .tau-sortable__placeholder')
                    .toArray()
                    .map((card) => ({
                        ...card,
                        sectionType: 'backlog',
                        holder: card,
                        coords: JSON.parse(card.dataset.dataItem!).coords
                    })),
                ...this.$grid.find('.tau-card-planner:not(.tau-section-invisible) .i-role-card, .tau-card-planner:not(.tau-section-invisible) .tau-sortable__placeholder')
                    .toArray()
                    .map((card) => ({
                        ...card,
                        sectionType: 'planned',
                        holder: card.parentElement,
                        coords: JSON.parse(card.dataset.dataItem!).coords
                    })),
                ...this.$grid.find('.tau-timeline-card > .tau-card-holder:not(.tau-section-invisible) .i-role-card')
                    .toArray()
                    .map((card) => ({
                        ...card,
                        sectionType: 'actual',
                        holder: card,
                        coords: JSON.parse(card.dataset.dataItem!).coords
                    }))
            ],
            (v) => v.getAttribute('data-entity-id'));

        return Object.keys(groupedCards).reduce((cards: _.Dictionary<HTMLElement[]>, key) => {
            const sectionTypes = _.chain(groupedCards[key]).pluck('sectionType').uniq().value();
            const hasBacklog = sectionTypes.filter((f) => f === 'backlog').length > 0;

            cards[key] = sectionTypes.length > 1 && !hasBacklog ?
                groupedCards[key].filter((card) => card.sectionType === 'actual') :
                groupedCards[key];

            return cards;
        }, {});
    }

    public _getTable() {
        return this.$grid.find('.tau-timeline-flow');
    }

    public _getPositionFromRect(cardRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top - this.offset,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    public _getIntersectionPoints(cardPos: IRect, targetPos: IRect) {
        const points = intersectRects(cardPos, targetPos);

        if (Math.abs(points.start.x - points.end.x) < 10) {
            points.end.x = targetPos.x > cardPos.x ? points.start.x + 10 : points.start.x - 10;
        }

        return points;
    }

    public _getElementSelectFunction = (id: string, el: ICardElementWithMetadata) =>
        () => _.first((this.cardsByEntityId[id] || [])
            .filter((c) => c.sectionType === el.sectionType && el.coords && _.isEqual(c.coords || '', el.coords || '')))!

    public _getClientRects(fromEl: ICardElementWithMetadata, toEl: ICardElementWithMetadata) {
        const rects = {
            cardRect: (fromEl.holder || fromEl).getBoundingClientRect(),
            targetRect: (toEl.holder || toEl).getBoundingClientRect(),
            tableRect: this.$table[0].getBoundingClientRect(),
            gridRect: this.$grid[0].getBoundingClientRect()
        };

        if (fromEl.sectionType === 'actual' || toEl.sectionType === 'actual') {
            const nowMarker = this.$table.find('.tau-timeline-now-marker');
            const nowMarkerRect = nowMarker[0].getBoundingClientRect();

            [rects.cardRect, rects.targetRect].forEach((rect) => {
                if (rect.left < nowMarkerRect.left && rect.width > nowMarkerRect.left - rect.left) {
                    Object.assign(rect, { width: nowMarkerRect.left - rect.left });
                }
            });
        }

        return rects;
    }

    public _processTargetCards(cards: ICardElementWithMetadata[]) {
        return cards.map((card) => {
            const $parent = $(card).parent();
            const parentCard = $parent.hasClass('i-role-timeline-planner-card-holder') ? $parent[0] : card;

            parentCard.sectionType = card.sectionType;
            parentCard.holder = card.holder;
            parentCard.coords = card.coords;
            return parentCard;
        });
    }
}
