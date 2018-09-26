import RenderingBackend from 'src/rendering/backends/rendering_backend';

export default class BoardRenderingBackend extends RenderingBackend {
    public getTable() {
        return this.getGrid().children('table');
    }

    public getGridRect() {
        return this.getTableRect();
    }
}
