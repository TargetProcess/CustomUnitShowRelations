import * as $ from 'jquery';
import Application from 'src/application';
import { IRelation } from 'src/relations';
import { IIntersection, intersectRects, IRect } from 'src/utils/intersection';
import * as _ from 'underscore';

export default abstract class RenderingBackend {
    protected application: Application;

    public constructor(application: Application) {
        this.application = application;
    }

    public isApplicableToCurrentUi() {
        return this.getGrid().closest('html').length !== 0;
    }

    public getGrid() {
        return $('.i-role-grid');
    }

    public appendSvg($svg: JQuery) {
        this.getGrid().append($svg);
    }

    public abstract getTable(): JQuery;

    public getGridRect() {
        return this.getGrid().get(0).getBoundingClientRect();
    }

    public getTableRect() {
        return this.getTable().get(0).getBoundingClientRect();
    }

    public getPositionFromRect(cardRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        return {
            x: cardRect.left - tableRect.left,
            y: cardRect.top - tableRect.top,
            height: cardRect.height,
            width: cardRect.width
        };
    }

    public getIntersectionPoints(cardPos: IRect, targetPos: IRect, _gridRect: ClientRect | DOMRect, _relation: IRelation): IIntersection | null {
        return intersectRects(cardPos, targetPos);
    }
}
