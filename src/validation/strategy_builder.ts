import { IBoardAxe, IBoardModel, IGenericBoardModel, ViewMode } from 'src/board';
import EntityWithStartDate, { KNOWN_ENTITIES } from 'src/validation/strategies/board/entity_with_start_date';
import GroupedTeamIterations from 'src/validation/strategies/board/grouped_team_iterations';
import VoidStrategy from 'src/validation/strategies/void_strategy';
import * as _ from 'underscore';

export async function buildValidationStategy(viewMode: ViewMode, boardModel: IGenericBoardModel) {
    const validationStrategy = getValidationStrategyForViewMode(viewMode, boardModel);
    await validationStrategy.initialize();
    return validationStrategy;
}

export function buildEmptyValidationStategy() {
    return new VoidStrategy();
}

function getValidationStrategyForViewMode(viewMode: ViewMode, boardModel: IGenericBoardModel) {
    switch (viewMode) {
        case ViewMode.Board:
            return buildStrategyForBoard(boardModel as IBoardModel);
        case ViewMode.List:
            return buildStrategyForList();
        case ViewMode.Timeline:
            return buildStrategyForTimeline();
        default:
            throw new Error(`Cannot find validation strategy for view mode ${viewMode}`);
    }
}

function buildStrategyForBoard(board: IBoardModel) {
    const groupedTeamIterationsStrategy = tryBuildGroupedTeamIterationsBoardStrategy(board);
    if (groupedTeamIterationsStrategy) {
        return groupedTeamIterationsStrategy;
    }

    const entityWithStartDateStrategy = tryBuildEntityWithStartDateStrategy(board);
    if (entityWithStartDateStrategy) {
        return entityWithStartDateStrategy;
    }

    return buildEmptyValidationStategy();
}

function buildStrategyForTimeline() {
    return buildEmptyValidationStategy();
}

function buildStrategyForList() {
    return buildEmptyValidationStategy();
}

function tryBuildGroupedTeamIterationsBoardStrategy(board: IBoardModel) {
    let axisWithGroupedTeamIterations: 'x' | 'y' | null = null;
    const hasSuitableEntity = (columnOrRows: IBoardAxe[]) => columnOrRows.some((columnOrRow) => columnOrRow.entity.type === 'teamiterationgroup');

    if (hasSuitableEntity(board.axes.x)) {
        axisWithGroupedTeamIterations = 'x';
    } else if (hasSuitableEntity(board.axes.y)) {
        axisWithGroupedTeamIterations = 'y';
    }
    if (!axisWithGroupedTeamIterations) {
        return null;
    }

    return new GroupedTeamIterations(board, axisWithGroupedTeamIterations);
}

function tryBuildEntityWithStartDateStrategy(board: IBoardModel) {
    let axisWithEntity: 'x' | 'y' | null = null;
    const hasSuitableEntity = (columnOrRows: IBoardAxe[]) => columnOrRows.some((columnOrRow) => _.includes(KNOWN_ENTITIES, columnOrRow.entity.type));

    if (hasSuitableEntity(board.axes.x)) {
        axisWithEntity = 'x';
    } else if (hasSuitableEntity(board.axes.y)) {
        axisWithEntity = 'y';
    }
    if (!axisWithEntity) {
        return null;
    }

    const foundEntityName = _.find(KNOWN_ENTITIES, (knownEntityName) => board.axes[axisWithEntity!].some(({ entity }) => entity.type === knownEntityName))!;
    return new EntityWithStartDate(board, foundEntityName, axisWithEntity);
}
