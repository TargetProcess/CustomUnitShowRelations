import Application from 'src/application';
import { ViewMode } from 'src/board';
import Card from 'src/cards/card';
import CardOnTimeline, { CardType } from 'src/cards/card_on_timeline';
import * as _ from 'underscore';

export default function extractCardsFromUi(application: Application) {
    if (application.getState().viewMode === ViewMode.Timeline) {
        return extractCardsFromTimeline(application);
    }

    return extractCardsFromBoardOrList(application);
}

function extractCardsFromBoardOrList(application: Application) {
    return application.getRenderingBackend().getGrid().find('.i-role-card, .tau-sortable__placeholder')
        .toArray()
        .map((element) => new Card(element))
        .filter((card) => !Number.isNaN(card.getEntityId()));
}

function extractCardsFromTimeline(application: Application) {
    const $grid = application.getRenderingBackend().getGrid();

    const groupedCards = _.groupBy<CardOnTimeline>(
        [
            ...$grid.find('.tau-backlog-body .i-role-card, .tau-backlog-body .tau-sortable__placeholder')
                .toArray()
                .map((cardElement) => new CardOnTimeline(cardElement, cardElement, CardType.Backlog)),
            ...$grid.find('.tau-card-planner:not(.tau-section-invisible) .i-role-card, .tau-card-planner:not(.tau-section-invisible) .tau-sortable__placeholder')
                .toArray()
                .map((cardElement) => new CardOnTimeline(cardElement, cardElement.parentElement!, CardType.Planned)),
            ...$grid.find('.tau-timeline-card > .tau-card-holder:not(.tau-section-invisible) .i-role-card')
                .toArray()
                .map((cardElement) => new CardOnTimeline(cardElement, cardElement.parentElement!, CardType.Actual))
        ],
        (card) => card.getEntityId());

    const result: CardOnTimeline[] = [];
    Object.keys(groupedCards).forEach((cardId) => {
        const uniqueCardTypes = _.uniq(groupedCards[cardId].map((card) => card.getCardType()));
        const hasBacklog = uniqueCardTypes.some((cardType) => cardType === CardType.Backlog);
        const filteredCards = uniqueCardTypes.length > 1 && !hasBacklog ?
            groupedCards[cardId].filter((card) => card.getCardType() === CardType.Actual) :
            groupedCards[cardId];

        result.push(...filteredCards);
    });

    return result;
}
