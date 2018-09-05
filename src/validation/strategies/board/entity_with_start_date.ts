import { IBoard } from 'src/index';
import { load } from 'src/utils/api';
import ValidationStrategy from 'src/validation/strategies/strategy';
import * as dateUtils from 'tau/utils/utils.date';

export const KNOWN_ENTITIES = [
    'release',
    'iteration',
    'teamiteration'
];

interface ICoords {
    x: string;
    y: string;
}

interface IEntityWithStartDate {
    Id: number;
    StartDate: string;
}

export default class EntityWithStartDate extends ValidationStrategy<IBoard> {
    private entityName: string;
    private axisWithEntity: 'x' | 'y';
    private loadingPromise: Promise<void> | null = null;
    private loadedEntities: IEntityWithStartDate[] = [];

    public constructor(board: IBoard, entityName: string, axisWithEntity: 'x' | 'y') {
        super(board);
        this.entityName = entityName;
        this.axisWithEntity = axisWithEntity;
    }

    public initialize() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        const entityIds = this.viewModel.axes[this.axisWithEntity].map((columnOrRow) => columnOrRow.entity.id).filter((id) => !!id);
        this.loadingPromise = load<IEntityWithStartDate[]>(this.entityName + 's', { where: `Id in(${entityIds.join(',')})` })
            .then((entities) => {
                this.loadedEntities = entities;
            });

        return this.loadingPromise;
    }

    public isRelationViolated(mainElement: HTMLElement, slaveElement: HTMLElement) {
        const mainElementCoords: ICoords = JSON.parse(mainElement.dataset.dataItem!).coords;
        const slaveElementCoords: ICoords = JSON.parse(slaveElement.dataset.dataItem!).coords;
        if (!mainElementCoords || !slaveElementCoords) {
            return false;
        }

        const mainElementEntity = this.loadedEntities.find((entity) => entity.Id === Number(mainElementCoords[this.axisWithEntity]));
        const slaveElementEntity = this.loadedEntities.find((entity) => entity.Id === Number(slaveElementCoords[this.axisWithEntity]));
        if (!mainElementEntity) {
            return false;
        }
        if (!slaveElementEntity) {
            return true;
        }

        const mainElementStartDate = dateUtils.parse(mainElementEntity.StartDate);
        const slaveElementStartDate = dateUtils.parse(slaveElementEntity.StartDate);
        if (!mainElementStartDate || !slaveElementStartDate) {
            return false;
        }

        return mainElementStartDate > slaveElementStartDate;
    }
}
