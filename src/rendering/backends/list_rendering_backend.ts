import { IRelation } from 'src/relations';
import RenderingBackend from 'src/rendering/backends/rendering_backend';
import { intersectRects, IRect } from 'src/utils/intersection';
import * as _ from 'underscore';

export default class ListRenderingBackend extends RenderingBackend {
    public appendSvg($svg: JQuery) {
        this.getGrid().find('.i-role-unit-editor-popup-position-within').append($svg);
    }

    public getTable() {
        return this.getGrid().find('.tau-list-level-0');
    }

    public getGridRect() {
        return this.getTableRect();
    }

    public getIntersectionPoints(cardPos: IRect, targetPos: IRect, gridRect: ClientRect | DOMRect, relation: IRelation) {
        if (Math.abs(targetPos.y - cardPos.y) <= 20) {
            return null;
        }

        const points = intersectRects(cardPos, targetPos);

        const sortedRelations = _.sortBy(this.application.getState().relations, (r) => r.masterEntityId);
        const relationIndex = sortedRelations.indexOf(relation);
        const distanceBetweenArrows = Math.min(50, gridRect.width / sortedRelations.length);
        const offset = (relationIndex + 1) * distanceBetweenArrows;

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
    }
}
