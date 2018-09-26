import * as $ from 'jquery';
import Application from 'src/application';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as validationStrategyBuilder from 'src/validation/strategy_builder';
import ViewMode from 'src/view_mode';
import { onBoardCreate, onDetailsCreate, onListCreate, onTimelineCreate } from 'tau/api/board/v1';
import * as _ from 'underscore';

import 'styles/index.scss';

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
        hideEmptyLanes: boolean;
        page?: { x: number, y: number }
    };
}

const FRAME_DURATION_60_FPS = 1000 / 60;

let initializedApplication: Application | null = null;

async function updateApplicationConfig(validationStrategy: ValidationStrategy<any>, boardSettings: IBoardSettings) {
    if (!initializedApplication) {
        initializedApplication = new Application();
    }

    await validationStrategy.initialize();
    await initializedApplication.reinitialize(validationStrategy, boardSettings);
    return initializedApplication;
}

const initialize = () => {
    onDetailsCreate(() => {
        initializedApplication && initializedApplication.disable();
    });

    onBoardCreate(async (boardModel) => {
        const application = await updateApplicationConfig(validationStrategyBuilder.buildStrategyForBoard(boardModel.board), boardModel.board.boardSettings);

        // When you first opens board, callbacks like onColumnResize are triggered after the actual event.
        // But if you change board configuration, TP begins to trigger them BEFORE the actual event.
        // We need to throttle everything just to normalize that behaviour ({ leading: false } was added to make throttle async).
        const throttledUpdateCards = _.throttle(() => {
            application.updateCards();
        }, FRAME_DURATION_60_FPS, { leading: false });

        const throttleUpdateCardsAndArrows = _.throttle(() => {
            application.updateCards();
            application.updateArrowPositions();
        }, FRAME_DURATION_60_FPS, { leading: false });

        boardModel.onCellsUpdate(() => {
            throttledUpdateCards();
        });
        boardModel.onCardDragging(() => {
            throttleUpdateCardsAndArrows();
        });
        boardModel.onColumnResize(() => {
            throttleUpdateCardsAndArrows();
        });
        boardModel.onZoomLevelChanged(() => {
            throttledUpdateCards();
        });
        boardModel.onExpandCollapseAxis(() => {
            throttleUpdateCardsAndArrows();
        });
    });

    onTimelineCreate((timeline) => {
        const timelineEvents = timeline.events;

        timelineEvents.onRender.once(async () => {
            const application = await updateApplicationConfig(validationStrategyBuilder.buildStrategyForTimeline(), timeline.boardSettings);

            const throttledUpdateCardsAndArrowPosition = _.throttle(() => {
                application.updateCards();
                application.updateArrowPositions();
            }, FRAME_DURATION_60_FPS, { leading: false });

            const throttledUpdateTimelineOffset = _.throttle((newTimelineOffset: number) => {
                application.updateTimelineOffset(newTimelineOffset);
            }, FRAME_DURATION_60_FPS);

            $('.tau-timeline-canvas').scroll((evt) => {
                throttledUpdateTimelineOffset(evt.target.scrollTop);
            });

            $('.tau-timeline-canvas').on('remove', () => {
                // Vertical paging detection
                throttledUpdateCardsAndArrowPosition();
            });

            $(window).resize(() => {
                application.updateArrowPositions();
            });

            timelineEvents.onCellUpdated.add(() => {
                throttledUpdateCardsAndArrowPosition();
            });

            timelineEvents.onMoveCardToCell.add(() => {
                throttledUpdateCardsAndArrowPosition();
            });

            timelineEvents.onRender.add(() => {
                application.updateCards();
            });

            timelineEvents.onPlannedDatesUpdating.add(() => {
                application.updateArrowPositions();
            });
        });
    });

    onListCreate((list) => {
        const listEvents = list.events;

        listEvents.onTreeRendered.once(async () => {
            const application = await updateApplicationConfig(validationStrategyBuilder.buildStrategyForList(), list.boardSettings);

            listEvents.onTreeRendered.add(() => {
                application.updateCards();
            });
            listEvents.onTreeChanged.add(() => {
                application.updateCards();
            });
            listEvents.onCardDragging.add(() => {
                application.updateCards();
                application.updateArrowPositions();
            });
            listEvents.onExpansionStateChanged.add(() => {
                application.updateCards();
            });
        });
    });
};

initialize();
