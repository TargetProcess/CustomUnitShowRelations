import Application from 'src/application';
import { IRelation } from 'src/data';
import Renderer from 'src/rendering/renderer';
import { intersectRects, IRect } from 'src/utils/intersection';
import ViewMode from 'src/view_mode';
import * as _ from 'underscore';

export default class ListRenderer extends Renderer {
    constructor(application: Application) {
        super(application);
        this.viewMode = ViewMode.LIST;
    }

    protected _appendSvgToGrid($svg: JQuery) {
        this.$grid.find('.i-role-unit-editor-popup-position-within').append($svg);
    }

    protected getTable() {
        return this.$grid.find('.tau-list-level-0');
    }

    protected getIntersectionPoints(cardPos: IRect, targetPos: IRect, gridRect: ClientRect | DOMRect, relation: IRelation) {
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

    protected processRelations(relations: IRelation[]) {
        return relations.map((relation, index) => ({ ...relation, index }));
    }
}
