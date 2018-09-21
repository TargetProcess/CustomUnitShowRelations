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
        if (entityIds.length === 0) {
            return Promise.resolve();
        }

        this.loadingPromise = load<IEntityWithStartDate[]>(this.entityName + 's', { where: `Id in(${entityIds.join(',')})`, take: 100 })
            .then((entities) => {
                this.loadedEntities = entities;
            });

        return this.loadingPromise;
    }

    public isRelationViolated(masterElement: HTMLElement, slaveElement: HTMLElement) {
        const masterElementCoords: ICoords = JSON.parse(masterElement.dataset.dataItem!).coords;
        const slaveElementCoords: ICoords = JSON.parse(slaveElement.dataset.dataItem!).coords;
        if (!masterElementCoords || !slaveElementCoords) {
            return false;
        }

        const masterElementEntity = this.loadedEntities.find((entity) => entity.Id === Number(masterElementCoords[this.axisWithEntity]));
        const slaveElementEntity = this.loadedEntities.find((entity) => entity.Id === Number(slaveElementCoords[this.axisWithEntity]));
        if (!masterElementEntity) {
            return false;
        }
        if (!slaveElementEntity) {
            return true;
        }

        const masterElementStartDate = dateUtils.parse(masterElementEntity.StartDate);
        const slaveElementStartDate = dateUtils.parse(slaveElementEntity.StartDate);
        if (!masterElementStartDate || !slaveElementStartDate) {
            return false;
        }

        return masterElementStartDate > slaveElementStartDate;
    }
}
