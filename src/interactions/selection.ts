import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { addClassToSvgElement, removeClassFromSvgElement } from 'src/utils/dom';
import { isBoardConfigChanged } from 'src/utils/state';
import tausTrack from 'src/utils/taus';
import * as _ from 'underscore';

const SELECTED_LINE_CLASS = 'line__selected';

export default class Selection {
    public static register(application: Application) {
        const selection = new Selection(application);
        application.registerReducer(selection.registerClickListenersReducer.bind(selection));
        application.registerReducer(selection.clearSelectedArrowsReducer.bind(selection));
        application.registerReducer(selection.highlightSelectedArrowsReducer.bind(selection));
        application.registerReducer(selection.unhighlightExtraArrowsReducer.bind(selection));

        return selection;
    }

    private application: Application;

    public constructor(application: Application) {
        this.application = application;
    }

    private selectArrow(arrow: Arrow) {
        this.application.getRenderingBackend().getSvg().find(`.line[data-arrow-id="${arrow.getId()}"]`).each((_index, lineElement) => {
            addClassToSvgElement(lineElement, SELECTED_LINE_CLASS);
        });
    }

    private unselectExtraArrows() {
        const { selectedArrows } = this.application.getState();
        const selectedArrowIds = new Set(selectedArrows.map((arrow) => arrow.getId()));

        this.application.getRenderingBackend().getSvg().find(`.${SELECTED_LINE_CLASS}`).each((_index, element) => {
            const arrowId = element.dataset.arrowId!;
            if (!selectedArrowIds.has(arrowId)) {
                removeClassFromSvgElement(element, SELECTED_LINE_CLASS);
            }
        });
    }

    private getNewSelectedArrows(clickedArrowId: string, isMultiselectMode: boolean) {
        const { arrows, selectedArrows } = this.application.getState();

        const clickedArrow = arrows.find((arrow) => arrow.getId() === clickedArrowId)!;
        const wasSelected = selectedArrows.includes(clickedArrow);
        if (isMultiselectMode) {
            return wasSelected ? selectedArrows.filter((arrow) => arrow !== clickedArrow) : [...selectedArrows, clickedArrow];
        } else {
            return wasSelected ? [] : [clickedArrow];
        }
    }

    private async registerClickListenersReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        const renderingBackend = this.application.getRenderingBackend();
        const $svg = renderingBackend.getSvg();
        $svg.on('mousedown', '.helperLine', (evt) => {
            const clickedArrowId = evt.target.dataset.arrowId!;
            const isCtrlOrCmdPressed = evt.ctrlKey || evt.metaKey;
            this.application.setState({ selectedArrows: this.getNewSelectedArrows(clickedArrowId, isCtrlOrCmdPressed) });
            return false;
        });

        const $grid = renderingBackend.getGrid();
        $grid.on('mousedown.highlights', ({ target }) => {
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
