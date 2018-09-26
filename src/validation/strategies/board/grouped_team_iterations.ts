import { IBoard } from 'src/index';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as dateUtils from 'tau/utils/utils.date';

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

    public isRelationViolated(masterElement: HTMLElement, slaveElement: HTMLElement) {
        const masterElementCoords: ICoords = JSON.parse(masterElement.dataset.dataItem!).coords;
        const slaveElementCoords: ICoords = JSON.parse(slaveElement.dataset.dataItem!).coords;
        if (!masterElementCoords || !slaveElementCoords) {
            return false;
        }

        if (!DATE_REGEX.test(masterElementCoords[this.axisWithGroupedTeamIterations])) {
            return false;
        }
        if (!DATE_REGEX.test(slaveElementCoords[this.axisWithGroupedTeamIterations])) {
            return true;
        }

        const masterElementStartDate = dateUtils.parse(masterElementCoords[this.axisWithGroupedTeamIterations]);
        const slaveElementStartDate = dateUtils.parse(slaveElementCoords[this.axisWithGroupedTeamIterations]);
        if (!masterElementStartDate || !slaveElementStartDate) {
            return false;
        }

        return masterElementStartDate > slaveElementStartDate;
    }
}
