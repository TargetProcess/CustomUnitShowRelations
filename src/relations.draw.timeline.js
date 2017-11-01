import _ from 'underscore';
import $ from 'jquery';
import RelationsDraw from './relations.draw.js';
import {intersectRects} from './utils/intersection';
import viewModes from './const.view.modes';

export default class RelationsDrawTimeline extends RelationsDraw {
    constructor(dataFetcher) {
        super(dataFetcher);
        this.viewMode = viewModes.TIMELINE;
    }

    _appendSvgToGrid($svg) {
        this.$grid.find('.tau-timeline.i-role-timeline-column').append($svg);
    }

    _getCardsGroupedByEntityId() {
        const groupedCards = _.groupBy(
            [
                ...this.$grid.find('.tau-backlog-body .i-role-card, .tau-backlog-body .tau-sortable__placeholder').toArray().map((card) => _.extend(card, {
                    sectionType: 'backlog',
                    holder: card,
                    coords: JSON.parse(card.dataset.dataItem).coords
                })),
                ...this.$grid.find('.tau-card-planner:not(.tau-section-invisible) .i-role-card, .tau-card-planner:not(.tau-section-invisible) .tau-sortable__placeholder')
                    .toArray()
                    .map((card) => _.extend(card, {
                        sectionType: 'planned',
                        holder: card.parentElement,
                        coords: JSON.parse(card.dataset.dataItem).coords
                    })),
                ...this.$grid.find('.tau-timeline-card > .tau-card-holder:not(.tau-section-invisible) .i-role-card')
                    .toArray()
                    .map((card) => _.extend(card, {
                        sectionType: 'actual',
                        holder: card,
                        coords: JSON.parse(card.dataset.dataItem).coords
                    }))],
            (v) => v.getAttribute('data-entity-id'));

        return _.keys(groupedCards).reduce((cards, key) => {
            const sectionTypes = _.chain(groupedCards[key]).pluck('sectionType').uniq().value();
            const hasBacklog = sectionTypes.filter((f) => f === 'backlog').length > 0;

            if (sectionTypes.length > 1 && !hasBacklog) {
                cards[key] = groupedCards[key].filter((card) => card.sectionType === 'actual');
            }
            else cards[key] = groupedCards[key];
            return cards;
        }, {});
    }

    _getTable() {
        return this.$grid.find('.tau-timeline-flow');
    }

    _getPositionFromRect(cardRect, tableRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top - this.offset,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    _getIntersectionPoints(cardPos, targetPos, gridRect, relation) {
        const points = intersectRects(cardPos, targetPos);

        if (Math.abs(points.start.x - points.end.x) < 10) {
            if (targetPos.x > cardPos.x) {
                points.end.x = points.start.x + 10;
            } else {
                points.end.x = points.start.x - 10;
            }
        }
        return points;
    }

    _getElementSelectFunction = (id, el) =>
        () => _.first((this.cardsByEntityId[id] || [])
            .filter((c) => c.sectionType === el.sectionType && el.coords && _.isEqual(c.coords || '', el.coords || '')));

    _getClientRects(fromEl, toEl) {
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
                    rect.width = nowMarkerRect.left - rect.left;
                }
            });
        }

        return rects;
    }

    _processTargetCards(cards) {
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
