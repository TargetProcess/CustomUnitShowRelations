import { IApplicationState } from 'src/application';
import * as _ from 'underscore';

export function isBoardConfigChanged(changes: Readonly<Partial<IApplicationState>>) {
    return !!changes.boardId || !!changes.viewMode;
}

export function getHighlightedArrows(state: IApplicationState) {
    const { isFocusActive, isUiActive, arrows, visibleRelationTypes, hoveredArrow, selectedArrows } = state;

    if (!isUiActive) {
        return [];
    }

    if (isFocusActive) {
        const violatedArrows = arrows.filter((arrow) => arrow.isViolated() && visibleRelationTypes.has(arrow.getRelation().relationType));
        return hoveredArrow ? [hoveredArrow, ...violatedArrows] : violatedArrows;
    }

    if (selectedArrows.length !== 0) {
        return hoveredArrow ? [hoveredArrow, ...selectedArrows] : selectedArrows;
    }

    if (hoveredArrow) {
        return [hoveredArrow];
    }

    return [];
}
