import Card from 'src/cards/card';

export enum CardType {
    Actual = 'actual',
    Backlog = 'backlog',
    Planned = 'planned'
}

export default class CardOnTimeline extends Card {
    private holder: HTMLElement;
    private cardType: CardType;

    public constructor(card: HTMLElement, holder: HTMLElement, cardType: CardType) {
        super(card);
        this.holder = holder;
        this.cardType = cardType;
    }

    public getElement() {
        const $parent = $(this.element).parent();
        if ($parent.hasClass('i-role-timeline-planner-card-holder')) {
            return $parent.get(0);
        }

        return this.element;
    }

    public getClientRect() {
        return this.holder.getBoundingClientRect();
    }

    public getCardType() {
        return this.cardType;
    }
}
