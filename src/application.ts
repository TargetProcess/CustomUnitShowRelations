import * as _isEqual from 'lodash.isequal';
import { ActionMenu } from 'src/action_menu';
import { Arrow, Arrows, ArrowsHighlighter } from 'src/arrows';
import { Card, CardHighlighter, Cards } from 'src/cards';
import { IBoardSettings } from 'src/index';
import { Hover, Selection } from 'src/interactions';
import { IRelation, RelationsFetcher, RelationType } from 'src/relations';
import { getBackendByViewMode, Renderer } from 'src/rendering';
import { Settings } from 'src/settings';
import ValidationStrategy from 'src/validation/strategies/strategy';
import ViewMode from 'src/view_mode';
import { ViolationFocus } from 'src/violations_focus';
import * as _ from 'underscore';

export interface IApplicationState {
    isOnAppropriatePage: boolean;
    boardId: number;
    viewMode: ViewMode;
    isUiActive: boolean;
    isFocusActive: boolean;
    cards: Card[];
    relations: IRelation[];
    arrows: Arrow[];
    hoveredArrow: Arrow | null;
    selectedArrows: Arrow[];
    visibleRelationTypes: Set<RelationType>;
    timelineDrawOffset: number;
}

export type Reducer = (changes: Readonly<Partial<IApplicationState>>) => Promise<Partial<IApplicationState>>;

const EMPTY_STATE: IApplicationState = {
    isOnAppropriatePage: false,
    boardId: -1,
    viewMode: ViewMode.Board,
    isUiActive: false,
    isFocusActive: false,
    cards: [],
    relations: [],
    arrows: [],
    selectedArrows: [],
    hoveredArrow: null,
    visibleRelationTypes: new Set([RelationType.Blocker, RelationType.Dependency, RelationType.Duplicate, RelationType.Link, RelationType.Relation]),
    timelineDrawOffset: 0
};

export default class Application {
    // @ts-ignore: No unused
    private relationsFetcher: RelationsFetcher;
    // @ts-ignore: No unused
    private actionMenu: ActionMenu;
    // @ts-ignore: No unused
    private violationFocus: ViolationFocus;
    // @ts-ignore: No unused
    private settings: Settings;
    // @ts-ignore: No unused
    private arrows: Arrows;
    private cards: Cards;
    private renderer: Renderer;
    // @ts-ignore: No unused
    private arrowsHighlighter: ArrowsHighlighter;
    // @ts-ignore: No unused
    private cardHighlighter: CardHighlighter;
    // @ts-ignore: No unused
    private hover: Hover;
    // @ts-ignore: No unused
    private selection: Selection;
    private validationStrategy!: ValidationStrategy;

    private state: Readonly<IApplicationState> = EMPTY_STATE;
    private reducers: Reducer[] = [];

    constructor() {
        this.relationsFetcher = RelationsFetcher.register(this);
        this.violationFocus = ViolationFocus.register(this);
        this.actionMenu = ActionMenu.register(this);
        this.settings = Settings.register(this);
        this.arrows = Arrows.register(this);
        this.cards = Cards.register(this);
        this.renderer = Renderer.register(this);
        this.arrowsHighlighter = ArrowsHighlighter.register(this);
        this.cardHighlighter = CardHighlighter.register(this);
        this.hover = Hover.register(this);
        this.selection = Selection.register(this);
    }

    public getState() {
        return this.state;
    }

    public async setState(stateChanges: Partial<IApplicationState>) {
        const changedPropertyNames = (Object.keys(stateChanges) as Array<keyof IApplicationState>).filter((key) => !_isEqual(stateChanges[key], this.state[key]));
        if (changedPropertyNames.length === 0) {
            return;
        }

        const filteredStateChanges = _.pick(stateChanges, changedPropertyNames) as Partial<IApplicationState>;
        this.state = { ...this.getState(), ...filteredStateChanges };

        const additionalStateChanges: Partial<IApplicationState> = await this.reducers.reduce(async (accPromise, reducer) => {
            return { ...await accPromise, ...await reducer(filteredStateChanges) };
        }, Promise.resolve({}));
        await this.setState(additionalStateChanges);
    }

    public registerReducer(reducer: Reducer) {
        this.reducers.push(reducer);
    }

    public updateCards() {
        if (!this.isStillOnAppropriatePage()) {
            this.disable();
            return;
        }

        this.cards.updateCards();
    }

    public updateArrowPositions() {
        if (!this.isStillOnAppropriatePage()) {
            this.disable();
            return;
        }

        this.renderer.updateLinesForAllArrows();
    }

    public updateTimelineOffset(newTimelineDrawOffset: number) {
        if (!this.isStillOnAppropriatePage()) {
            this.disable();
            return;
        }

        if (this.getState().timelineDrawOffset !== newTimelineDrawOffset) {
            this.setState({ timelineDrawOffset: newTimelineDrawOffset });
        }
    }

    public async reinitialize(validationStrategy: ValidationStrategy, boardSettings: IBoardSettings) {
        await this.disable();

        this.validationStrategy = validationStrategy;
        const { settings } = boardSettings;
        await this.setState({
            ...EMPTY_STATE,
            isOnAppropriatePage: true,
            boardId: settings.id,
            viewMode: settings.viewMode
        });
    }

    public async disable() {
        if (!this.getState().isOnAppropriatePage) {
            return;
        }

        await this.setState({
            ...EMPTY_STATE,
            isOnAppropriatePage: false
        });
    }

    public getRenderingBackend() {
        return getBackendByViewMode(this.getState().viewMode, this);
    }

    public getValidationStrategy() {
        return this.validationStrategy;
    }

    private isStillOnAppropriatePage() {
        return this.getRenderingBackend().isApplicableToCurrentUi();
    }
}
