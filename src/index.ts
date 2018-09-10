import * as $ from 'jquery';
import Application from 'src/application';
import ListRenderer from 'src/rendering/list_renderer';
import Renderer from 'src/rendering/renderer';
import TimelineRenderer from 'src/rendering/timeline_renderer';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as validationStrategyBuilder from 'src/validation/strategy_builder';
import ViewMode from 'src/view_mode';
import { onBoardCreate, onDetailsCreate, onListCreate, onTimelineCreate } from 'tau/api/board/v1';

import 'src/index.scss';

export interface IBoard {
    boardSettings: IBoardSettings;
    axes: {
        x: IBoardAxe[];
        y: IBoardAxe[];
    };
}

export interface IBoardAxe {
    id: string;
    entity: {
        id: number;
        type: string;
    };
}

export interface IBoardSettings {
    settings: {
        id: number;
        viewMode: ViewMode;
    };
}

let application: Application | null = null;

const createModel = (RendererModel: typeof Renderer, validationStrategy: ValidationStrategy<any>, boardSettings: IBoardSettings) => {
    if (!application) {
        application = new Application(RendererModel, validationStrategy, boardSettings);
    } else {
        application.setConfig(RendererModel, validationStrategy, boardSettings);
    }

    return application;
};

const initialize = () => {
    onDetailsCreate((details) => {
        createModel(Renderer, validationStrategyBuilder.buildStrategyDetailsBoard(), details.boardSettings);
    });

    onBoardCreate((boardModel) => {
        const model = createModel(Renderer, validationStrategyBuilder.buildStrategyForBoard(boardModel.board), boardModel.board.boardSettings);

        boardModel.onCellsUpdate(model.redraw);
        boardModel.onCardDragging(model.redraw);
        boardModel.onColumnResize(model.redraw);
        boardModel.onPagingAnimated(model.redraw);
        boardModel.onZoomLevelChanged(model.redraw);
        boardModel.onExpandCollapseAxis(model.redraw);
    });

    onTimelineCreate((timeline) => {
        const timelineEvents = timeline.events;

        timelineEvents.onRender.once(() => {
            const model = createModel(TimelineRenderer as any, validationStrategyBuilder.buildStrategyForTimeline(), timeline.boardSettings);

            $('.tau-timeline-canvas').scroll((evt) => {
                model.update({ y: evt.target.scrollTop });
            });
            $(window).resize(() => {
                model.update();
            });

            timelineEvents.onCellUpdated.add(() => {
                model.redraw();
            });

            timelineEvents.onMoveCardToCell.add(() => {
                model.redraw();
            });

            timelineEvents.onRender.add(() => {
                model.redraw();
            });
            timelineEvents.onLocalDateRangeChanged.add(() => {
                model.redraw();
            });
            timelineEvents.onViewTimelineTracksCountChanged.add(() => {
                model.redraw();
            });
            timelineEvents.onPlannedDatesUpdating.add(($card: JQuery) => {
                model.updateRelationsForCard($card.data('id'));
            });
        });
    });

    onListCreate((list) => {
        const listEvents = list.events;

        listEvents.onTreeRendered.once(() => {
            const model = createModel(ListRenderer as any, validationStrategyBuilder.buildStrategyForList(), list.boardSettings);

            listEvents.onTreeRendered.add(() => {
                model.redraw();
            });
            listEvents.onTreeChanged.add(() => {
                model.redraw();
            });
            listEvents.onCardDragging.add(($card: JQuery) => {
                model.updateRelationsForCard($card.data('id'));
            });
            listEvents.onExpansionStateChanged.add(() => {
                model.redraw();
            });
        });
    });
};

const initializeSubscriptions = () => {
    $(document).on('click', '.i-role-hide-empty-lanes', () => application && application.redraw());
};

initialize();
initializeSubscriptions();
