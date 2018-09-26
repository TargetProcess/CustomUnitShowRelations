import Application, { IApplicationState } from 'src/application';
import buildArrows from 'src/arrows/arrows_builder';
import differenceBy from 'src/utils/difference_by';
import * as _ from 'underscore';

export default class Arrows {
    public static register(application: Application) {
        const arrows = new Arrows(application);
        application.registerReducer(arrows.updateArrowsOnCardsOrRelationsChangedReducer.bind(arrows));

        return arrows;
    }

    private application: Application;

    public constructor(application: Application) {
        this.application = application;
    }

    private async updateArrowsOnCardsOrRelationsChangedReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!changes.cards && !changes.relations) {
            return {};
        }

        const cards = changes.cards || this.application.getState().cards;
        const relations = changes.relations || this.application.getState().relations;

        const currentArrows = this.application.getState().arrows;
        const extractedArrows = buildArrows(cards, relations, this.application.getValidationStrategy());

        const newArrows = differenceBy(extractedArrows, currentArrows, (a1, a2) => a1.equals(a2));
        const removedArrows = differenceBy(currentArrows, extractedArrows, (a1, a2) => a1.equals(a2));
        if (newArrows.length === 0 && removedArrows.length === 0) {
            return {};
        }

        const remainingArrows = _.difference(currentArrows, removedArrows);
        return { arrows: [...newArrows, ...remainingArrows] };
    }
}
