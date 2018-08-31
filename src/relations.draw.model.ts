import RelationsData from 'src/data';
import { IBoardSettings } from 'src/index';
import LegendModel from 'src/legend/legend.model';
import RelationDraw from 'src/relations.draw';
import * as _ from 'underscore';

export default class RelationsDrawModel {
    private dataFetcher: RelationsData;
    private legendModel!: LegendModel;
    private relationsDraw!: RelationDraw;

    constructor(RelationsDraw: typeof RelationDraw, boardSettings: IBoardSettings) {
        this.dataFetcher = new RelationsData();
        this.dataFetcher.updated.add(() => this.dataFetcher.refresh().then(() => this.redraw()));
        this.setConfig(RelationsDraw, boardSettings);
    }

    public executeDrawOperation = (operation: () => void) => {
        if (this.legendModel && this.legendModel.isShown) {
            operation();
        }
    }

    public update = _.throttle((offset?: { y: number }) => {
        this.executeDrawOperation(this.relationsDraw.update.bind(this.relationsDraw, offset));
    }, 30);

    public redraw = _.throttle(() => {
        this.executeDrawOperation(this.relationsDraw.redraw);
    }, 100);

    public updateRelationsForCard = _.throttle(
        (id: string) => this.executeDrawOperation(this.relationsDraw.updateRelationsForCard.bind(this.relationsDraw, id)),
        20,
        { leading: false }
    );

    public setConfig(RelationsDraw: typeof RelationDraw, boardSettings: IBoardSettings) {
        if (this.relationsDraw) {
            this.relationsDraw.removeAll();
        }

        if (this.legendModel) {
            this.legendModel.cleanup();
        }

        this.dataFetcher.subscribeForRelationsUpdate();
        this.relationsDraw = new RelationsDraw(this.dataFetcher);
        this.legendModel = new LegendModel(this.relationsDraw, this.dataFetcher, boardSettings);
    }
}
