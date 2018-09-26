import * as React from 'react';
import Legend from 'src/action_menu/ui/legend';
import { RelationType } from 'src/relations';

interface ILegendWrapperProps {
    onPropsUpdated: { add: (callback: (newProps: ILegendWrapperState) => void, context: object) => void, remove: (context: object) => void };
}

interface ILegendWrapperState {
    isVisible: boolean;
    isExpanded: boolean;
    visibleRelationTypes: Set<RelationType>;
    onExpansionStateChange: (newState: boolean) => void;
    toggleRelationTypeVisibility: (relationType: RelationType) => void;
}

export default class LegendWrapper extends React.Component<ILegendWrapperProps, ILegendWrapperState> {
    constructor(props: ILegendWrapperProps) {
        super(props);

        this.props.onPropsUpdated.add((newProps) => {
            this.setState(newProps);
        }, this);
    }

    public componentWillUnmount() {
        this.props.onPropsUpdated.remove(this);
    }

    public render() {
        return <Legend {...this.state} />;
    }
}
