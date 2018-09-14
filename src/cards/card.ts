export default class Card {
    protected element: HTMLElement;
    protected entityId: number;
    protected _isVisible: boolean;

    public constructor(element: HTMLElement) {
        this.element = element;
        this.entityId = Number(element.getAttribute('data-entity-id'));
        this._isVisible = element.offsetParent !== null;
    }

    public getEntityId() {
        return this.entityId;
    }

    public getElement() {
        return this.element;
    }

    public getClientRect() {
        return this.getElement().getBoundingClientRect();
    }

    public isVisible() {
        return this._isVisible;
    }

    public equals(anotherCard: Card) {
        return this.getEntityId() === anotherCard.getEntityId() &&
            this.getElement() === anotherCard.getElement() &&
            this.isVisible() === anotherCard.isVisible();
    }
}
