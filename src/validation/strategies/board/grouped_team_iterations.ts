import { IBoard } from 'src/index';
import ValidationStrategy from 'src/validation/strategies/strategy';

interface ICoords {
    x: string;
    y: string;
}

const DATE_REGEX = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;

export default class GroupedTeamIterations extends ValidationStrategy<IBoard> {
    private axisWithGroupedTeamIterations: 'x' | 'y';

    public constructor(board: IBoard, axisWithGroupedTeamIterations: 'x' | 'y') {
        super(board);
        this.axisWithGroupedTeamIterations = axisWithGroupedTeamIterations;
    }

    public isRelationViolated(mainElement: HTMLElement, slaveElement: HTMLElement) {
        const mainElementCoords: ICoords = JSON.parse(mainElement.dataset.dataItem!).coords;
        const slaveElementCoords: ICoords = JSON.parse(slaveElement.dataset.dataItem!).coords;
        if (!mainElementCoords || !slaveElementCoords) {
            return false;
        }

        if (!DATE_REGEX.test(slaveElementCoords[this.axisWithGroupedTeamIterations])) {
            return true;
        }

        const mainElementStartDate = Date.parse(mainElementCoords[this.axisWithGroupedTeamIterations]);
        const slaveElementStartDate = Date.parse(slaveElementCoords[this.axisWithGroupedTeamIterations]);
        if (Number.isNaN(mainElementStartDate) || Number.isNaN(slaveElementStartDate)) {
            return false;
        }

        return mainElementStartDate > slaveElementStartDate;
    }
}
