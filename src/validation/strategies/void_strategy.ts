import ValidationStrategy from 'src/validation/strategies/strategy';

export default class VoidStrategy extends ValidationStrategy<void> {
    public constructor() {
        super(undefined);
    }

    public isRelationViolated(_mainElement: HTMLElement, _slaveElement: HTMLElement) {
        return false;
    }
}
