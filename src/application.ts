import RelationsData from 'src/data';
import { IBoardSettings } from 'src/index';
import InteractionModel from 'src/interaction_model';
import LegendModel from 'src/legend/legend.model';
import Renderer from 'src/rendering/renderer';
import ValidationStrategy from 'src/validation/strategies/strategy';
import ViewMode from 'src/view_mode';
import ViolationFocusModel from 'src/violations_focus/violations_focus_model';
import * as _ from 'underscore';

export default class Application {
    public update = _.throttle((offset?: { y: number }) => {
        this.executeDrawOperation(this.renderer.update.bind(this.renderer, offset));
    }, 30);

    public redraw = _.throttle(() => {
        this.executeDrawOperation(this.renderer.redraw);
    }, 100);

    public updateRelationsForCard = _.throttle(
        (id: string) => this.executeDrawOperation(this.renderer.updateRelationsForCard.bind(this.renderer, id)),
        20,
        { leading: false }
    );

    public isActive = false;
    public viewMode!: ViewMode;
    public boardId!: number;
    public dataFetcher: RelationsData;
    public legendModel!: LegendModel;
    public renderer!: Renderer;
    public validationStrategy!: ValidationStrategy;
    public violationFocusModel: ViolationFocusModel;
    public interactionModel: InteractionModel;

    constructor(RendererModel: typeof Renderer, validationStrategy: ValidationStrategy, boardSettings: IBoardSettings) {
        this.dataFetcher = new RelationsData();
        this.dataFetcher.updated.add(() => this.dataFetcher.refresh().then(() => this.redraw()));

        this.violationFocusModel = new ViolationFocusModel(this);
        this.interactionModel = new InteractionModel(this);

        this.setConfig(RendererModel, validationStrategy, boardSettings);
    }

    public executeDrawOperation = (operation: () => void) => {
        if (this.isActive) {
            operation();
        }
    }

    public setConfig(RendererModel: typeof Renderer, validationStrategy: ValidationStrategy, boardSettings: IBoardSettings) {
        if (this.renderer) {
            this.renderer.removeAll();
        }
        if (this.legendModel) {
            this.legendModel.cleanup();
        }
        this.violationFocusModel.cleanup();

        this.viewMode = boardSettings.settings.viewMode;
        this.boardId = boardSettings.settings.id;
        this.validationStrategy = validationStrategy;
        this.violationFocusModel.updateUi();
        this.dataFetcher.subscribeForRelationsUpdate();
        this.renderer = new RendererModel(this);
        this.legendModel = new LegendModel(this);
    }

    public setIsActive(newValue: boolean) {
        this.isActive = newValue;
        this.violationFocusModel.updateUi();
    }
}
