import $ from 'jquery';
import _ from 'underscore';

import {addBusListener} from 'targetprocess-mashup-helper/lib/events';

import {getRelationsById, getRelationsByIds} from './data';
import {drawLegend, drawRelations, highlightCardsByRelations, removeAllDrawn, createSvg} from './draw';

import './index.css';

const onBoardInitialize = (next) => {

    addBusListener('board_plus', 'initialize', ({data: {viewMode}}) => next({viewMode}));
    addBusListener('newlist', 'initialize', () => next({viewMode: 'newlist'}));

};

const onBoardDestroy = (next) => {

    addBusListener('board_plus', 'destroy', () => next());
    addBusListener('newlist', 'destroy', () => next());

};

const onToolbarRendered = (next) => addBusListener('board.toolbar', 'boardSettings.ready:last + afterRender:last', (e,
    {boardSettings: {settings}},
    {element: $el}
) => next($el, settings));

const onUnitClick = (next) => $(document.body).on('click', '.tau-board-unit_type_relations-counter-in-out', next);

const initUnit = () => {

    let isEnabled = true;
    let isActivated = false;

    onBoardInitialize(() => {

        isEnabled = true;

    });

    onBoardDestroy(() => {

        isEnabled = false;

    });

    onUnitClick((e) => {

        if (!isEnabled) return;

        e.stopPropagation();
        e.preventDefault();

        const $card = $(e.target).parents('.i-role-card');
        const card = $card[0];

        const entityId = $card.data('entityId');
        const entityType = $card.data('entityType');

        if (!entityId) return;

        // on timelines backlog, svg is not over it, so disable
        if (isActivated) {

            removeAllDrawn();
            isActivated = false;

            return;

        }

        isActivated = true;

        getRelationsById(entityId)
            .then((relations) => {

                removeAllDrawn();

                const $svg = createSvg();

                drawRelations(relations, card);
                highlightCardsByRelations(relations, card);
                drawLegend(relations, entityId, entityType);

                $svg.on('click', () => {

                    isActivated = false;
                    removeAllDrawn();

                });

            });

    });

};

const applyByCards = (cards) => {

    const cardsById = _.groupBy(cards, (card) => $(card).data('entityId'));
    const ids = Object.keys(cardsById);

    getRelationsByIds(ids)
        .then((relations_) => {

            const relations = relations_.filter((rel) => ids.indexOf(String(rel.entity.id)) >= 0)
                .map((v, k) => ({index: k, ...v}));
            const groupedRelations = _.groupBy(relations, (rel) => rel.main.id);

            Object.keys(groupedRelations)
            .forEach((entityId) => {

                const entityRelations = groupedRelations[entityId];
                const entityCards = cardsById[entityId];

                entityCards.forEach((card) => {

                    drawRelations(entityRelations, card);
                    highlightCardsByRelations(entityRelations, card, {outline: false});

                });

            });

            drawLegend(relations);

        });

};

const getCards = () => $('.i-role-grid .i-role-card').toArray();

const initButton = () => {

    let isEnabled = false;
    const enabledText = 'Hide Relations';
    const disabledText = 'Show Relations';

    let $button;

    const createButton = () => {

        $button = $(`<button class="tau-btn" type="button" style="margin-left: 10px;" />`);

        $button.on('click', () => {

            isEnabled = !isEnabled;

            if (isEnabled) {

                $button.text(enabledText);
                $.when(getCards()).then((cards) => {

                    removeAllDrawn();

                    const $svg = createSvg();

                    applyByCards(cards);

                    $svg.on('click', () => {

                        removeAllDrawn();
                        isEnabled = false;
                        $button.text(disabledText);

                    });

                });

            } else {

                $button.text(disabledText);
                removeAllDrawn();

            }

        });

        return $button;

    };

    onToolbarRendered(($el, {viewMode}) => {

        if (viewMode === 'list' || viewMode === 'timeline') return;

        isEnabled = false;
        $el.find('.tau-board-view-switch').after(createButton());
        $button.text(isEnabled ? enabledText : disabledText);

    });

};

initUnit();
initButton();
