import _ from 'underscore';
import $ from 'jquery';
import LegendModel from './legend/legend.model';
import RelationsData from './data';

export default class RelationsDrawModel {
    constructor(RelationsDraw, boardSettings) {
        this.dataFetcher = new RelationsData();
        this.dataFetcher.updated.add(() => this.dataFetcher.refresh().then(() => this.redraw()));
        this.setConfig(RelationsDraw, boardSettings);
    }

    executeDrawOperation = (operation) => {
        if (this.legendModel && this.legendModel.isShown) {
            operation();
        }
    };

    update = _.throttle((offset) => {
        this.executeDrawOperation(this.relationsDraw.update.bind(this.relationsDraw, offset));
    }, 30);

    redraw = _.throttle(() => {
        this.executeDrawOperation(this.relationsDraw.redraw);
    }, 100);

    updateRelationsForCard = _.throttle(
        (id) => this.executeDrawOperation(this.relationsDraw.updateRelationsForCard.bind(this.relationsDraw, id)),
        20,
        {leading: false}
    );

    setConfig(RelationsDraw, boardSettings) {
        if (this.relationsDraw) {
            this.relationsDraw.removeAll();
            delete this.relationsDraw;
        }
        if (this.legendModel) {
            this.legendModel.destroy();
            delete this.legendModel;
        }
        this.dataFetcher.subscribeForRelationsUpdate();
        this.relationsDraw = new RelationsDraw(this.dataFetcher);
        this.legendModel = new LegendModel(this.relationsDraw, this.dataFetcher, boardSettings);
    }
}
