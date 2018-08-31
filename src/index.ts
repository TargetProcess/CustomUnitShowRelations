import * as $ from 'jquery';
import * as subscriptions from 'src/bus.subscriptions';
import ViewMode from 'src/const.view.modes';
import RelationsDraw from 'src/relations.draw';
import RelationsDrawList from 'src/relations.draw.list';
import RelationsDrawModel from 'src/relations.draw.model';
import RelationsDrawTimeline from 'src/relations.draw.timeline';
import { onBoardCreate, onDetailsCreate, onListCreate, onTimelineCreate } from 'tau/api/board/v1';

import 'src/index.css';

export interface IBoardSettings {
    settings: {
        id: number;
        viewMode: ViewMode;
    };
}

let currentModel: RelationsDrawModel | null = null;

const createModel = (RelationsDrawConstructor: typeof RelationsDraw, boardSettings: IBoardSettings) => {
    if (!currentModel) {
        currentModel = new RelationsDrawModel(RelationsDrawConstructor, boardSettings);
    } else {
        currentModel.setConfig(RelationsDrawConstructor, boardSettings);
    }

    return currentModel;
};

const initialize = () => {
    onDetailsCreate((details) => {
        createModel(RelationsDraw, details.boardSettings);
    });

    onBoardCreate((board) => {
        const model = createModel(RelationsDraw, board.board.boardSettings);

        board.onCellsUpdate(model.redraw);
        board.onCardDragging(model.redraw);
        board.onColumnResize(model.redraw);
        board.onPagingAnimated(model.redraw);
        board.onZoomLevelChanged(model.redraw);
        board.onExpandCollapseAxis(model.redraw);
    });

    onTimelineCreate((timeline) => {
        const timelineEvents = timeline.events;

        timelineEvents.onRender.once(() => {
            const model = createModel(RelationsDrawTimeline as any, timeline.boardSettings);

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
            const model = createModel(RelationsDrawList as any, list.boardSettings);

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
    subscriptions.onHideEmptyLines(() => currentModel && currentModel.redraw());
};

initialize();
initializeSubscriptions();
