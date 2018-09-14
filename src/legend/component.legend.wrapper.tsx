import * as React from 'react';
import ComponentLegend from 'src/legend/component.legend';
import { RelationType } from 'src/relations';

interface IComponentLegendWrapperProps {
    onPropsUpdated: { add: (callback: (newProps: IComponentLegendWrapperState) => void, context: object) => void, remove: (context: object) => void };
}

interface IComponentLegendWrapperState {
    isVisible: boolean;
    isExpanded: boolean;
    visibleRelationTypes: Set<RelationType>;
    onExpansionStateChange: (newState: boolean) => void;
    toggleRelationTypeVisibility: (relationType: RelationType) => void;
}

export default class ComponentLegendWrapper extends React.Component<IComponentLegendWrapperProps, IComponentLegendWrapperState> {
    constructor(props: IComponentLegendWrapperProps) {
        super(props);

        this.props.onPropsUpdated.add((newProps) => {
            this.setState(newProps);
        }, this);
    }

    public componentWillUnmount() {
        this.props.onPropsUpdated.remove(this);
    }

    public render() {
        return <ComponentLegend {...this.state} />;
    }
}
