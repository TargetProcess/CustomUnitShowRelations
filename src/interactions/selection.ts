import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { isBoardConfigChanged } from 'src/utils/state';
import tausTrack from 'src/utils/taus';
import * as _ from 'underscore';

const SELECTED_LINE_CLASS = 'line__selected';
const MUTED_LINE_CLASS = 'line__muted';

export default class Selection {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.registerClickListenersReducer.bind(this));
        this.application.registerReducer(this.clearSelectedArrowsReducer.bind(this));
        this.application.registerReducer(this.highlightSelectedArrowsReducer.bind(this));
    }

    private getSvg() {
        return $('svg.mashupCustomUnitShowRelations__svg');
    }

    private getGrid() {
        return $('.i-role-grid');
    }

    private selectLine(arrow: Arrow) {
        this.getSvg().find(`.line[data-arrow-id="${arrow.getId()}"]`).each((_index, element) => {
            element.classList.add(SELECTED_LINE_CLASS);
            element.classList.remove(MUTED_LINE_CLASS);
        });
    }

    private clearAllSelectedLines() {
        this.getSvg().find(`.${SELECTED_LINE_CLASS}`).each((_index, element) => element.classList.remove(SELECTED_LINE_CLASS));
    }

    private muteAllLines() {
        this.getSvg().find('.line').each((_index, element) => element.classList.add(MUTED_LINE_CLASS));
    }

    private clearAllMutedLines() {
        this.getSvg().find(`.${MUTED_LINE_CLASS}`).each((_index, element) => element.classList.remove(MUTED_LINE_CLASS));
    }

    private async registerClickListenersReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        const handleLineClick = (evt: JQuery.Event<HTMLElement, null>) => {
            const { arrows, selectedArrows } = this.application.getState();

            const clickedArrowId = Number(evt.target.dataset!.arrowId);
            const clickedArrow = arrows.find((arrow) => arrow.getId() === clickedArrowId)!;
            const wasSelected = selectedArrows.includes(clickedArrow);
            const newSelectedArrows = wasSelected ?
                selectedArrows.filter((arrow) => arrow !== clickedArrow) :
                [...selectedArrows, clickedArrow];

            this.application.setState({ selectedArrows: newSelectedArrows });

            return false;
        };
        this.getSvg().on('mousedown', '.line', handleLineClick);
        this.getSvg().on('mousedown', '.helperLine', handleLineClick);

        this.getGrid().on('mousedown.highlights', ({ target }) => {
            if ($(target).parents().hasClass('i-role-card')) {
                return;
            }

            tausTrack({
                name: 'reset-highlights'
            });

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

        this.clearAllSelectedLines();
        this.clearAllMutedLines();

        if (selectedArrows.length === 0) {
            return {};
        }

        this.muteAllLines();
        selectedArrows.forEach((arrow) => this.selectLine(arrow));

        return {};
    }
}
