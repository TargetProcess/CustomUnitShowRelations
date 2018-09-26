import { IRelation } from 'src/relations';
import RenderingBackend from 'src/rendering/backends/rendering_backend';
import { intersectRects, IRect } from 'src/utils/intersection';

export default class TimelineRenderingBackend extends RenderingBackend {
    public appendSvg($svg: JQuery) {
        this.getGrid().find('.tau-timeline.i-role-timeline-column').append($svg);
    }

    public getTable() {
        return this.getGrid().find('.tau-timeline-flow');
    }

    public getPositionFromRect(cardRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top - this.application.getState().timelineDrawOffset,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    public getIntersectionPoints(cardPos: IRect, targetPos: IRect, _gridRect: ClientRect | DOMRect, _relation: IRelation) {
        const points = intersectRects(cardPos, targetPos);

        if (Math.abs(points.start.x - points.end.x) < 10) {
            points.end.x = targetPos.x > cardPos.x ? points.start.x + 10 : points.start.x - 10;
        }

        return points;
    }
}
