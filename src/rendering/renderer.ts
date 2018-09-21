import classnames from 'libs/classNames';
import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import * as styles from 'src/rendering/styles';
import { createSvgFromTemplate } from 'src/rendering/svg';
import { generateBezierCoords } from 'src/rendering/utils';
import { IIntersection } from 'src/utils/intersection';
import { isBoardConfigChanged } from 'src/utils/state';
import ViewMode from 'src/view_mode';
import * as _ from 'underscore';

interface ICreateLineOptions {
    cssClass: string;
    bezierCoords: string;
    stroke: string;
    fill?: string;
}

function isValidIntersection(intersection: IIntersection) {
    return !_.some([intersection.start.x, intersection.start.y, intersection.end.x, intersection.end.y], (p) => _.isNaN(p));
}

function createLine(arrow: Arrow, options: ICreateLineOptions) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', options.cssClass || '');
    line.setAttribute('d', options.bezierCoords);
    line.setAttribute('stroke', options.stroke || 'grey');
    line.setAttribute('fill', options.fill || 'none');
    line.setAttribute('data-arrow-id', String(arrow.getId()));

    return line;
}

export default class Renderer {
    private $svg: JQuery | null = null;
    private arrowLines = new Map<Arrow, SVGPathElement[]>();
    private application: Application;

    constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.uiReducer.bind(this));
        this.application.registerReducer(this.updateArrowLinesReducer.bind(this));
        this.application.registerReducer(this.handleUiChangesReducer.bind(this));
        this.application.registerReducer(this.handleTimelineOffsetChangedReducer.bind(this));
    }

    public updateLinesForAllArrows() {
        if (!this.isEnabled()) {
            return;
        }

        const backend = this.application.getRenderingBackend();
        const gridRect = backend.getGridRect();
        const tableRect = backend.getTableRect();

        for (const arrow of this.arrowLines.keys()) {
            this.updateLinesForArrow(arrow, gridRect, tableRect);
        }
    }

    private isEnabled() {
        const { viewMode, isOnAppropriatePage } = this.application.getState();
        return viewMode !== ViewMode.Details && isOnAppropriatePage;
    }

    private getArrowsToShow() {
        const { arrows, visibleRelationTypes, isUiActive } = this.application.getState();
        if (!isUiActive) {
            return [];
        }

        return arrows.filter((arrow) => visibleRelationTypes.has(arrow.getRelation().relationType));
    }

    private renderArrow(arrow: Arrow) {
        const lines = this.getLinesForArrow(arrow);
        this.arrowLines.set(arrow, lines);
        const $svg = this.getSvg();
        lines.forEach((line) => $svg.append(line));
    }

    private removeArrow(arrow: Arrow) {
        const lines = this.arrowLines.get(arrow) || [];
        lines.forEach((line) => line.remove());
        this.arrowLines.delete(arrow);
    }

    private getLinesForArrow(arrow: Arrow) {
        const backend = this.application.getRenderingBackend();
        const bezierCoords = this.getBezierCoordsForArrow(arrow, backend.getGridRect(), backend.getTableRect());
        if (!bezierCoords) {
            return [];
        }

        const relation = arrow.getRelation();
        const hasViolations = arrow.isViolated();
        const color = styles.getRelationColor(relation.relationType, hasViolations);
        const helperLine = createLine(arrow, {
            cssClass: classnames('helperLine', { helperLine__violated: hasViolations }),
            bezierCoords,
            stroke: color
        });

        const line = createLine(arrow, {
            cssClass: classnames('line', { line__violated: hasViolations }),
            bezierCoords,
            stroke: color
        });

        line.setAttribute('marker-start', `url(#${styles.getRelationTypeMarkerStartId(relation.relationType, hasViolations)})`);
        line.setAttribute('marker-end', `url(#${styles.getRelationTypeMarkerEndId(relation.relationType, hasViolations)})`);

        return [helperLine, line];
    }

    private syncArrowsWithApplication() {
        const arrowsOnUi = [...this.arrowLines.keys()];
        const arrowsInApplication = this.getArrowsToShow();

        const newArrows = _.difference(arrowsInApplication, arrowsOnUi);
        const removedArrows = _.difference(arrowsOnUi, arrowsInApplication);
        if (newArrows.length === 0 && removedArrows.length === 0) {
            return;
        }

        removedArrows.forEach((arrow) => this.removeArrow(arrow));
        newArrows.forEach((arrow) => this.renderArrow(arrow));
    }

    private updateLinesForArrow(arrow: Arrow, gridRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        const lines = this.arrowLines.get(arrow) || [];
        const bezierCoords = this.getBezierCoordsForArrow(arrow, gridRect, tableRect);
        if (!bezierCoords) {
            return;
        }

        lines.forEach((line) => {
            const currentBezierCoords = line.getAttribute('d');
            if (bezierCoords !== currentBezierCoords) {
                line.setAttribute('d', bezierCoords);
            }
        });
    }

    private getBezierCoordsForArrow(arrow: Arrow, gridRect: ClientRect | DOMRect, tableRect: ClientRect | DOMRect) {
        const masterCardRect = arrow.getMasterCard().getClientRect();
        const slaveCardRect = arrow.getSlaveCard().getClientRect();
        const relation = arrow.getRelation();

        const backend = this.application.getRenderingBackend();
        const masterCardPosition = backend.getPositionFromRect(masterCardRect, tableRect);
        const slaveCardPosition = backend.getPositionFromRect(slaveCardRect, tableRect);
        const points = backend.getIntersectionPoints(masterCardPosition, slaveCardPosition, gridRect, relation);

        if (!points || !isValidIntersection(points)) {
            return null;
        }

        return generateBezierCoords(points.start, points.end);
    }

    private getSvg() {
        this.checkAndUpdateSvg();
        return this.$svg!;
    }

    private checkAndUpdateSvg() {
        const isSvgMissingOrUnmounted = !this.$svg || this.$svg.closest('html').length === 0;
        if (isSvgMissingOrUnmounted) {
            const backend = this.application.getRenderingBackend();
            const $table = backend.getTable();
            this.$svg = createSvgFromTemplate($table.width()!, $table.height()!);
            backend.appendSvg(this.$svg);
        }
    }

    private attachUi() {
        this.arrowLines.clear();
        if (this.$svg) {
            this.$svg.remove();
            this.$svg = null;
        }

        this.checkAndUpdateSvg();
    }

    private async uiReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.isEnabled()) {
            return {};
        }

        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        this.attachUi();
        return {};
    }

    private async updateArrowLinesReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.isEnabled()) {
            return {};
        }

        if (!changes.arrows) {
            return {};
        }

        this.syncArrowsWithApplication();
        this.updateLinesForAllArrows();

        return {};
    }

    private async handleUiChangesReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.isEnabled()) {
            return {};
        }

        if (_.isUndefined(changes.isUiActive) && !changes.visibleRelationTypes) {
            return {};
        }

        this.syncArrowsWithApplication();
        return {};
    }

    private async handleTimelineOffsetChangedReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.isEnabled()) {
            return {};
        }

        if (_.isUndefined(changes.timelineDrawOffset)) {
            return {};
        }

        this.updateLinesForAllArrows();
        return {};
    }
}
