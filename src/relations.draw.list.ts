import ViewMode from 'src/const.view.modes';
import RelationsData, { IRelation } from 'src/data';
import RelationsDraw from 'src/relations.draw';
import { intersectRects, IRect } from 'src/utils/intersection';
import * as _ from 'underscore';

export default class RelationsDrawList extends RelationsDraw {
    constructor(dataFetcher: RelationsData) {
        super(dataFetcher);
        this.viewMode = ViewMode.LIST;
    }

    public _appendSvgToGrid($svg: JQuery) {
        this.$grid.find('.i-role-unit-editor-popup-position-within').append($svg);
    }

    public _getTable() {
        return this.$grid.find('.tau-list-level-0');
    }

    public _getIntersectionPoints(cardPos: IRect, targetPos: IRect, gridRect: ClientRect | DOMRect, relation: IRelation) {
        if (Math.abs(targetPos.y - cardPos.y) > 20) {
            const points = intersectRects(cardPos, targetPos);

            // if list, make income relations to the left, outcome to right of screen

            const offset = ((relation.index || 0) + 1) * 50;

            points.start.x = cardPos.x + gridRect.width - offset - 50;
            points.end.x = targetPos.x + gridRect.width - offset - 50;

            if (points.start.y === points.end.y) {
                if (targetPos.y > cardPos.y) {
                    points.start.y -= 5;
                    points.end.y += 5;
                } else {
                    points.start.y += 5;
                    points.end.y -= 5;
                }
            }

            return points;
        } else {
            return null;
        }
    }

    public _processRelations(relations: IRelation[]) {
        return relations.map((relation, index) => ({ ...relation, index }));
    }
}
