import { RelationType } from 'src/relations';

export default abstract class ValidationStrategy<T = void> {
    protected viewModel: T;

    public constructor(viewModel: T) {
        this.viewModel = viewModel;
    }

    public initialize() {
        return Promise.resolve();
    }

    public isApplicableToRelationType(relationType: RelationType) {
        return relationType === RelationType.Blocker || relationType === RelationType.Dependency;
    }

    public abstract isRelationViolated(_masterElement: HTMLElement, _slaveElement: HTMLElement): boolean;
}
