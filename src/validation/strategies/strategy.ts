export default abstract class ValidationStrategy<T = void> {
    protected viewModel: T;

    public constructor(viewModel: T) {
        this.viewModel = viewModel;
    }

    public abstract isRelationViolated(_mainElement: HTMLElement, _slaveElement: HTMLElement): boolean;
    public initialize() {
        return Promise.resolve();
    }
}
