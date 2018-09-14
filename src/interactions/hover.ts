import * as $ from 'jquery';
import Application, { IApplicationState } from 'src/application';
import { isBoardConfigChanged } from 'src/utils/state';

export default class Hover {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.registerHoverListenersReducer.bind(this));
    }

    private hoverArrowById(arrowId: number) {
        const arrowToHover = this.application.getState().arrows.find((arrow) => arrow.getId() === arrowId)!;
        this.application.setState({ hoveredArrow: arrowToHover });
    }

    private unhoverArrow() {
        this.application.setState({ hoveredArrow: null });
    }

    private getSvg() {
        return $('svg.mashupCustomUnitShowRelations__svg');
    }

    private async registerHoverListenersReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        this.getSvg().on('mouseenter', '.line', (evt) => this.hoverArrowById(Number(evt.target.dataset!.arrowId)));
        this.getSvg().on('mouseleave', '.line', () => this.unhoverArrow());
        return {};
    }
}
