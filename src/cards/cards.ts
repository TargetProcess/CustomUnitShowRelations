import Application, { IApplicationState } from 'src/application';
import extractCardsFromUi from 'src/cards/cards_extractor';
import differenceBy from 'src/utils/difference_by';
import { isBoardConfigChanged } from 'src/utils/state';
import * as _ from 'underscore';

export default class Cards {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.updateCardsOnBoardChangedReducer.bind(this));
    }

    public updateCards() {
        const currentCards = this.application.getState().cards;
        const extractedCards = extractCardsFromUi(this.application.getState().viewMode);

        const newCards = differenceBy(extractedCards, currentCards, (c1, c2) => c1.equals(c2));
        const removedCards = differenceBy(currentCards, extractedCards, (c1, c2) => c1.equals(c2));
        if (newCards.length === 0 && removedCards.length === 0) {
            return;
        }

        const remainingCards = _.difference(currentCards, removedCards);

        this.application.setState({ cards: [...newCards, ...remainingCards] });
    }

    private async updateCardsOnBoardChangedReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!this.application.getState().isOnAppropriatePage) {
            return {};
        }

        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        return { cards: extractCardsFromUi(this.application.getState().viewMode) };
    }
}
