import * as $ from 'jquery';
import Application from 'src/application';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as validationStrategyBuilder from 'src/validation/strategy_builder';
import ViewMode from 'src/view_mode';
import { onBoardCreate, onListCreate, onTimelineCreate } from 'tau/api/board/v1';
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
    onBoardCreate(async (boardModel) => {
        const application = await updateApplicationConfig(validationStrategyBuilder.buildStrategyForBoard(boardModel.board), boardModel.board.boardSettings);

        boardModel.onCellsUpdate(() => {
            application.updateCards();
        });
        boardModel.onCardDragging(() => {
            application.updateCards();
            application.updateArrowPositions();
        });
        boardModel.onColumnResize(() => {
            application.updateCards();
            application.updateArrowPositions();
        });
        boardModel.onZoomLevelChanged(() => {
            application.updateCards();
        });
        boardModel.onExpandCollapseAxis(() => {
            application.updateCards();
            application.updateArrowPositions();
        });
    });

    onTimelineCreate((timeline) => {
        const timelineEvents = timeline.events;

        timelineEvents.onRender.once(async () => {
            const application = await updateApplicationConfig(validationStrategyBuilder.buildStrategyForTimeline(), timeline.boardSettings);

            const throttledUpdateCardsAndArrowPosition = _.throttle(() => {
                application.updateCards();
                application.updateArrowPositions();
            }, 30);

            const throttledUpdateTimelineOffset = _.throttle((newTimelineOffset: number) => {
                application.updateTimelineOffset(newTimelineOffset);
            }, 30);

            $('.tau-timeline-canvas').scroll((evt) => {
                throttledUpdateTimelineOffset(evt.target.scrollTop);
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
