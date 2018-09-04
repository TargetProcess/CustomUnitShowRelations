interface ICoords {
    x: string;
    y: string;
}

const DATE_REGEX = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;

export function checkForRelationViolationOnBoard(mainElement: HTMLElement, slaveElement: HTMLElement) {
    const mainElementCoords: ICoords = JSON.parse(mainElement.dataset.dataItem!).coords;
    const slaveElementCoords: ICoords = JSON.parse(slaveElement.dataset.dataItem!).coords;
    if (!mainElementCoords || !slaveElementCoords) {
        return false;
    }

    let axisWithDate: 'x' | 'y' | null = null;
    if (DATE_REGEX.test(mainElementCoords.x)) {
        axisWithDate = 'x';
    } else if (DATE_REGEX.test(mainElementCoords.y)) {
        axisWithDate = 'y';
    }
    if (!axisWithDate) {
        return false;
    }
    if (!DATE_REGEX.test(slaveElementCoords[axisWithDate])) {
        return true;
    }

    const mainElementStartDate = Date.parse(mainElementCoords[axisWithDate]);
    const slaveElementStartDate = Date.parse(slaveElementCoords[axisWithDate]);
    if (Number.isNaN(mainElementStartDate) || Number.isNaN(slaveElementStartDate)) {
        return false;
    }

    return mainElementStartDate > slaveElementStartDate;
}
