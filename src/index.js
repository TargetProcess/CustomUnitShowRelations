import $ from 'jquery';
import {onBoardCreate, onTimelineCreate, onListCreate, onDetailsCreate} from 'tau/api/board/v1';
import * as subscriptions from './bus.subscriptions';
import RelationsDraw from './relations.draw';
import RelationsDrawTimeline from './relations.draw.timeline';
import RelationsDrawList from './relations.draw.list';
import Model from './relations.draw.model';

import './index.css';

let model = {
    isEmpty: true,
    redraw: $.noop,
    setConfig: $.noop
};

const createModel = (RelationsDrawConstructor, boardSettings) => {
    if (model.isEmpty) {
        model = new Model(RelationsDrawConstructor, boardSettings);
    }
    else {
        model.setConfig(RelationsDrawConstructor, boardSettings);
    }
};

const initialize = () => {
    onDetailsCreate((details) => {
        createModel(RelationsDraw, details.boardSettings);
    });

    onBoardCreate((board) => {
        createModel(RelationsDraw, board.board.boardSettings);

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
            createModel(RelationsDrawTimeline, timeline.boardSettings);

            $('.tau-timeline-canvas').scroll((evt) => {
                model.update({y: evt.target.scrollTop});
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
            timelineEvents.onPlannedDatesUpdating.add(($card) => {
                model.updateRelationsForCard($card.data('id'));
            });
        });

    });

    onListCreate((list) => {
        const listEvents = list.events;

        listEvents.onTreeRendered.once(() => {
            createModel(RelationsDrawList, list.boardSettings);

            listEvents.onTreeRendered.add(() => {
                model.redraw();
            });
            listEvents.onTreeChanged.add(() => {
                model.redraw();
            });
            listEvents.onCardDragging.add((card) => {
                model.updateRelationsForCard(card.data('id'));
            });
            listEvents.onExpansionStateChanged.add(() => {
                model.redraw();
            });
        });
    });
};

const initializeSubsriptions = () => {
    subscriptions.onHideEmptyLines(() => model.redraw());
};

initialize();
initializeSubsriptions();
