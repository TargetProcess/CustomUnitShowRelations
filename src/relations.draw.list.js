import _ from 'Underscore';
import RelationsDraw from './relations.draw.js';
import relationDirection from './relationDirections';
import {intersectRects} from './utils/intersection';
import viewModes from './const.view.modes';

export default class RelationsDrawList extends RelationsDraw {
    constructor(dataFetcher) {
        super(dataFetcher);
        this.viewMode = viewModes.LIST;
    }

    _appendSvgToGrid($svg) {
        this.$grid.find('.i-role-unit-editor-popup-position-within').append($svg);
    }

    _getTable() {
        return this.$grid.find('.tau-list-level-0');
    }

    _getIntersectionPoints(cardPos, targetPos, gridRect, relation) {
        if (Math.abs(targetPos.y - cardPos.y) > 20) {

            const points = intersectRects(cardPos, targetPos);

            // if list, make income relations to the left, outcome to right of screen

            const offset = ((relation.index || 0) + 1) * 50;

            if (relation.directionType === relationDirection.inbound) {
                points.start.x = cardPos.x + offset;
                points.end.x = targetPos.x + offset;

            } else {
                points.start.x = cardPos.x + gridRect.width - offset - 50;
                points.end.x = targetPos.x + gridRect.width - offset - 50;
            }

            if (points.start.y === points.end.y) {
                if (targetPos.y > cardPos.y) {
                    points.start.y = points.start.y - 5;
                    points.end.y = points.end.y + 5;
                } else {
                    points.start.y = points.start.y + 5;
                    points.end.y = points.end.y - 5;
                }
            }

            return points;
        } else {
            return null;
        }
    }

    _processRelations(relations) {
        relations = _.groupBy(relations, (v) => v.directionType);
        relations = _.map(relations, (list) => list.map((v, k) => ({index: k, ...v})));
        relations = _.reduce(relations, (res, v) => res.concat(v), []);
        return relations;
    }
}
