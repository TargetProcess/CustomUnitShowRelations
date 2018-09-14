import * as $ from 'jquery';
import Card from 'src/cards/card';
import CardOnTimeline, { CardType } from 'src/cards/card_on_timeline';
import ViewMode from 'src/view_mode';
import * as _ from 'underscore';

export default function extractCardsFromUi(viewMode: ViewMode) {
    if (viewMode === ViewMode.Timeline) {
        return extractCardsFromTimeline();
    }

    return extractCardsFromBoardOrList();
}

function extractCardsFromBoardOrList() {
    return $('.i-role-grid .i-role-card, .tau-sortable__placeholder').toArray()
        .map((element) => new Card(element))
        .filter((card) => !Number.isNaN(card.getEntityId()));
}

function extractCardsFromTimeline() {
    const groupedCards = _.groupBy<CardOnTimeline>(
        [
            ...$('.i-role-grid .tau-backlog-body .i-role-card, .tau-backlog-body .tau-sortable__placeholder')
                .toArray()
                .map((cardElement) => new CardOnTimeline(cardElement, cardElement, CardType.Backlog)),
            ...$('.i-role-grid .tau-card-planner:not(.tau-section-invisible) .i-role-card, .tau-card-planner:not(.tau-section-invisible) .tau-sortable__placeholder')
                .toArray()
                .map((cardElement) => new CardOnTimeline(cardElement, cardElement.parentElement!, CardType.Planned)),
            ...$('.i-role-grid .tau-timeline-card > .tau-card-holder:not(.tau-section-invisible) .i-role-card')
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
