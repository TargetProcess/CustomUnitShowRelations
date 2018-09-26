import * as $ from 'jquery';
import Application from 'src/application';
import { IGenericBoardModel } from 'src/board';
import { onBoardCreate, onDetailsCreate, onListCreate, onTimelineCreate } from 'tau/api/board/v1';
import * as _ from 'underscore';

import 'styles/index.scss';

const FRAME_DURATION_60_FPS = 1000 / 60;

let initializedApplication: Application | null = null;

async function updateApplicationConfig(boardModel: IGenericBoardModel) {
    if (!initializedApplication) {
        initializedApplication = new Application();
    }

    await initializedApplication.reinitialize(boardModel);
    return initializedApplication;
}

const initialize = () => {
    onDetailsCreate(() => {
        initializedApplication && initializedApplication.disable();
    });

    onBoardCreate(async (boardModel) => {
        const application = await updateApplicationConfig(boardModel.board);

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
            const application = await updateApplicationConfig(timeline);

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
            const application = await updateApplicationConfig(list);

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
