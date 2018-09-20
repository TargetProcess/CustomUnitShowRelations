import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { isBoardConfigChanged } from 'src/utils/state';
import tausTrack from 'src/utils/taus';
import * as _ from 'underscore';

const SELECTED_LINE_CLASS = 'line__selected';

export default class Selection {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.registerClickListenersReducer.bind(this));
        this.application.registerReducer(this.clearSelectedArrowsReducer.bind(this));
        this.application.registerReducer(this.highlightSelectedArrowsReducer.bind(this));
        this.application.registerReducer(this.unhighlightExtraArrowsReducer.bind(this));
    }

    private getGrid() {
        return $('.i-role-grid');
    }

    private selectArrow(arrow: Arrow) {
        this.application.getRenderingBackend().getSvg().find(`.line[data-arrow-id="${arrow.getId()}"]`).each((_index, lineElement) => {
            lineElement.classList.add(SELECTED_LINE_CLASS);
        });
    }

    private unselectExtraArrows() {
        const { selectedArrows } = this.application.getState();
        const selectedArrowIds = new Set(selectedArrows.map((arrow) => arrow.getId()));

        this.application.getRenderingBackend().getSvg().find(`.${SELECTED_LINE_CLASS}`).each((_index, element) => {
            const arrowId = element.dataset.arrowId!;
            if (!selectedArrowIds.has(arrowId)) {
                element.classList.remove(SELECTED_LINE_CLASS);
            }
        });
    }

    private async registerClickListenersReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        const handleLineClick = (evt: JQuery.Event<HTMLElement, null>) => {
            const { arrows, selectedArrows } = this.application.getState();

            const clickedArrowId = evt.target.dataset.arrowId;
            const clickedArrow = arrows.find((arrow) => arrow.getId() === clickedArrowId)!;
            const wasSelected = selectedArrows.includes(clickedArrow);
            const newSelectedArrows = wasSelected ?
                selectedArrows.filter((arrow) => arrow !== clickedArrow) :
                [...selectedArrows, clickedArrow];

            this.application.setState({ selectedArrows: newSelectedArrows });

            return false;
        };

        const $svg = this.application.getRenderingBackend().getSvg();
        $svg.on('mousedown', '.line', handleLineClick);
        $svg.on('mousedown', '.helperLine', handleLineClick);

        this.getGrid().on('mousedown.highlights', ({ target }) => {
            if ($(target).parents().hasClass('i-role-card')) {
                return;
            }

            tausTrack({ name: 'reset-highlights' });
            this.application.setState({ selectedArrows: [] });
        });

        return {};
    }

    private async clearSelectedArrowsReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.arrows && !changes.isFocusActive && _.isUndefined(changes.isUiActive)) {
            return {};
        }

        return { selectedArrows: [] };
    }

    private async highlightSelectedArrowsReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.selectedArrows) {
            return {};
        }

        const { selectedArrows } = this.application.getState();
        this.unselectExtraArrows();
        selectedArrows.forEach((arrow) => this.selectArrow(arrow));

        return {};
    }

    private async unhighlightExtraArrowsReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.visibleRelationTypes) {
            return {};
        }

        const { selectedArrows, visibleRelationTypes } = this.application.getState();
        const newSelectedArrows = selectedArrows.filter((selectedArrow) => visibleRelationTypes.has(selectedArrow.getRelation().relationType));
        return { selectedArrows: newSelectedArrows };
    }
}
