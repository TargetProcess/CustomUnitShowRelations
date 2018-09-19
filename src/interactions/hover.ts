import Application, { IApplicationState } from 'src/application';
import { Arrow } from 'src/arrows';
import { isBoardConfigChanged } from 'src/utils/state';

export default class Hover {
    private application: Application;

    public constructor(application: Application) {
        this.application = application;

        this.application.registerReducer(this.registerHoverListenersReducer.bind(this));
    }

    private hoverArrowById(arrowId: number) {
        const arrowToHover = this.application.getState().arrows.find((arrow) => arrow.getId() === arrowId)!;
        this.addTitleToSvg(arrowToHover);
        this.application.setState({ hoveredArrow: arrowToHover });
    }

    private unhoverArrow() {
        this.application.setState({ hoveredArrow: null });
    }

    private addTitleToSvg(arrow: Arrow) {
        const $svg = this.application.getRenderingBackend().getSvg();
        const title = this.findOrCreateTitleElement($svg);
        title.textContent = arrow.isViolated() ?
            `${arrow.getRelation().relationType} - Out of order` :
            `${arrow.getRelation().relationType}`;
    }

    private findOrCreateTitleElement($svg: JQuery) {
        const $existingTitle: JQuery<SVGTitleElement> = $svg.find('title') as any;
        if ($existingTitle.length !== 0) {
            return $existingTitle.get(0);
        }

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = 'SVG Title Demo example';
        $svg.prepend(title);
        return title;
    }

    private async registerHoverListenersReducer(changes: Readonly<Partial<IApplicationState>>) {
        if (!isBoardConfigChanged(changes)) {
            return {};
        }

        const $svg = this.application.getRenderingBackend().getSvg();
        $svg.on('mouseenter', '.line', (evt) => this.hoverArrowById(Number(evt.target.dataset!.arrowId)));
        $svg.on('mouseleave', '.line', () => this.unhoverArrow());
        return {};
    }
}
