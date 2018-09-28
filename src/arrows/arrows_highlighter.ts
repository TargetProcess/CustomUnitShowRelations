import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { addClassToSvgElement, removeClassFromSvgElement } from 'src/utils/dom';
import { getHighlightedArrows } from 'src/utils/state';
import * as _ from 'underscore';

const HIGHLIGTED_SVG_CLASS = 'arrows-highlighted';
const HIGHLIGTED_LINE_CLASS = 'line__highlighted';

export default class ArrowsHighlighter {
    public static register(application: Application) {
        const arrowsHighlighter = new ArrowsHighlighter(application);
        application.registerReducer(arrowsHighlighter.updateHighlightingReducer.bind(arrowsHighlighter));

        return arrowsHighlighter;
    }

    private application: Application;

    public constructor(application: Application) {
        this.application = application;
    }

    private enableHighlighting() {
        const $svg = this.application.getRenderingBackend().getSvg();
        if ($svg.length === 0) {
            return;
        }

        addClassToSvgElement($svg.get(0), HIGHLIGTED_SVG_CLASS);
    }

    private disableHighlighting() {
        const $svg = this.application.getRenderingBackend().getSvg();
        if ($svg.length === 0) {
            return;
        }

        removeClassFromSvgElement($svg.get(0), HIGHLIGTED_SVG_CLASS);
    }

    private highlightArrow(arrow: Arrow) {
        this.application.getRenderingBackend().getSvg().find(`.line[data-arrow-id="${arrow.getId()}"]`).each((_index, element) => {
            addClassToSvgElement(element, HIGHLIGTED_LINE_CLASS);
        });
    }

    private unhighlightExtraArrows(arrowsToHighlight: Arrow[]) {
        const highlightedArrowIds = new Set(arrowsToHighlight.map((arrow) => arrow.getId()));

        $(`.line.${HIGHLIGTED_LINE_CLASS}`).each((_index, lineElement) => {
            const arrowId = lineElement.getAttribute('data-arrow-id')!;
            if (!highlightedArrowIds.has(arrowId)) {
                removeClassFromSvgElement(lineElement, HIGHLIGTED_LINE_CLASS);
            }
        });
    }

    private async updateHighlightingReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.selectedArrows && _.isUndefined(changes.hoveredArrow) && !changes.arrows &&
            _.isUndefined(changes.isFocusActive) && !changes.visibleRelationTypes) {
            return {};
        }

        const arrowsToHighlight = getHighlightedArrows(this.application.getState());
        this.unhighlightExtraArrows(arrowsToHighlight);

        if (arrowsToHighlight.length === 0) {
            this.disableHighlighting();
            return {};
        }
        this.enableHighlighting();

        arrowsToHighlight.forEach((arrow) => this.highlightArrow(arrow));
        return {};
    }
}
