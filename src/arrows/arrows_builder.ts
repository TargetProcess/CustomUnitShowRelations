import Arrow from 'src/arrows/arrow';
import { Card } from 'src/cards';
import { IRelation } from 'src/relations';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as _ from 'underscore';

export default function buildArrows<T extends Card = Card>(cards: T[], relations: IRelation[], validationStrategy: ValidationStrategy) {
    const cardsGroupedByEntityId = cards.reduce((acc, card) => {
        const cardsWithSimilarEntityId = acc.get(card.getEntityId()) || [];
        cardsWithSimilarEntityId.push(card);

        return acc.set(card.getEntityId(), cardsWithSimilarEntityId);
    }, new Map<number, T[]>());

    const result: Array<Arrow<T>> = [];
    relations.forEach((relation) => {
        let amountOfArrowsForRelation = 0;
        const masterCards = cardsGroupedByEntityId.get(relation.masterEntityId) || [];
        masterCards.forEach((masterCard) => {
            if (!masterCard.isVisible()) {
                return;
            }

            const slaveCards = cardsGroupedByEntityId.get(relation.slaveEntityId) || [];
            slaveCards.forEach((slaveCard) => {
                if (!slaveCard.isVisible()) {
                    return;
                }
                amountOfArrowsForRelation++;

                const isRelationViolated = validationStrategy.isRelationViolated(masterCard.getElement(), slaveCard.getElement());
                result.push(new Arrow(
                    `${relation.id}-${amountOfArrowsForRelation}`,
                    masterCard,
                    slaveCard,
                    relation,
                    isRelationViolated
                ));
            });
        });
    });

    return result;
}
