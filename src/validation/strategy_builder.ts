import { IBoard, IBoardAxe } from 'src/index';
import EntityWithStartDate, { KNOWN_ENTITIES } from 'src/validation/strategies/board/entity_with_start_date';
import GroupedTeamIterations from 'src/validation/strategies/board/grouped_team_iterations';
import VoidStrategy from 'src/validation/strategies/void_strategy';

export function buildStrategyForBoard(board: IBoard) {
    const groupedTeamIterationsStrategy = tryBuildGroupedTeamIterationsBoardStrategy(board);
    if (groupedTeamIterationsStrategy) {
        return groupedTeamIterationsStrategy;
    }

    const entityWithStartDateStrategy = tryBuildEntityWithStartDateStrategy(board);
    if (entityWithStartDateStrategy) {
        return entityWithStartDateStrategy;
    }

    return new VoidStrategy();
}

export function buildStrategyDetailsBoard() {
    return new VoidStrategy();
}

export function buildStrategyForTimeline() {
    return new VoidStrategy();
}

export function buildStrategyForList() {
    return new VoidStrategy();
}

function tryBuildGroupedTeamIterationsBoardStrategy(board: IBoard) {
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

function tryBuildEntityWithStartDateStrategy(board: IBoard) {
    let axisWithEntity: 'x' | 'y' | null = null;
    const hasSuitableEntity = (columnOrRows: IBoardAxe[]) => columnOrRows.some((columnOrRow) => KNOWN_ENTITIES.includes(columnOrRow.entity.type));

    if (hasSuitableEntity(board.axes.x)) {
        axisWithEntity = 'x';
    } else if (hasSuitableEntity(board.axes.y)) {
        axisWithEntity = 'y';
    }
    if (!axisWithEntity) {
        return null;
    }

    const foundEntityName = KNOWN_ENTITIES.find((knownEntityName) => board.axes[axisWithEntity!].some(({ entity }) => entity.type === knownEntityName))!;
    return new EntityWithStartDate(board, foundEntityName, axisWithEntity);
}
