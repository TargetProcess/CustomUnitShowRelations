import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { getHighlightedArrows } from 'src/utils/state';
import * as _ from 'underscore';

const HIGHLIGTED_SVG_CLASS = 'arrows-highlighted';
const HIGHLIGTED_ARROW_CLASS = 'highlighted';

export default class ArrowsHighlighter {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.updateHighlightingReducer.bind(this));
    }

    private enableHighlighting() {
        this.application.getRenderingBackend().getSvg().get(0).classList.add(HIGHLIGTED_SVG_CLASS);
    }

    private disableHighlighting() {
        this.application.getRenderingBackend().getSvg().get(0).classList.remove(HIGHLIGTED_SVG_CLASS);
    }

    private highlightArrow(arrow: Arrow) {
        this.application.getRenderingBackend().getSvg().find(`.line[data-arrow-id="${arrow.getId()}"]`).each((_index, element) => {
            element.classList.add(HIGHLIGTED_ARROW_CLASS);
        });
    }

    private unhighlightExtraArrows(arrowsToHighlight: Arrow[]) {
        const highlightedArrowIds = new Set(arrowsToHighlight.map((arrow) => arrow.getId()));

        $(`.${HIGHLIGTED_ARROW_CLASS}`).each((_index, lineElement) => {
            const arrowId = Number(lineElement.dataset!.arrowId);
            if (!highlightedArrowIds.has(arrowId)) {
                lineElement.classList.remove(HIGHLIGTED_ARROW_CLASS);
            }
        });
    }

    private async updateHighlightingReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.selectedArrows && _.isUndefined(changes.hoveredArrow) && _.isUndefined(changes.isFocusActive)) {
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
