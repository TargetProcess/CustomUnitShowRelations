import { Card } from 'src/cards';
import { IRelation } from 'src/relations';

export default class Arrow<T extends Card = Card> {
    private masterCard: T;
    private slaveCard: T;
    private relation: IRelation;
    private violated: boolean;

    public constructor(masterCard: T, slaveCard: T, relation: IRelation, isViolated: boolean) {
        this.masterCard = masterCard;
        this.slaveCard = slaveCard;
        this.relation = relation;
        this.violated = isViolated;
    }

    public getId() {
        return this.relation.id;
    }

    public getMasterCard() {
        return this.masterCard;
    }

    public getSlaveCard() {
        return this.slaveCard;
    }

    public getRelation() {
        return this.relation;
    }

    public isViolated() {
        return this.violated;
    }

    public equals(anotherArrow: Arrow<Card>) {
        return this.getMasterCard().equals(anotherArrow.getMasterCard()) &&
            this.getSlaveCard().equals(anotherArrow.getSlaveCard()) &&
            this.getRelation() === anotherArrow.getRelation();
    }
}
